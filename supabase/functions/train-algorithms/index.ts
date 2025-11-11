import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlgorithmConfig {
  id: string;
  algorithm_name: string;
  weight: number;
  parameters: Record<string, any>;
}

interface AlgorithmPerformance {
  model_used: string;
  avg_accuracy: number;
  total_predictions: number;
  excellent_predictions: number;
  f1_score: number;
  overall_score: number;
}

interface TrainingHistoryEntry {
  algorithm_name: string;
  previous_weight: number;
  new_weight: number;
  previous_parameters: Record<string, any>;
  new_parameters: Record<string, any>;
  performance_improvement: number;
  training_metrics: {
    avg_performance: number;
    avg_accuracy: number;
    avg_f1_score: number;
    total_evaluations: number;
  };
}

interface ResponseData {
  success: boolean;
  trainedCount?: number;
  updatedCount?: number;
  trainingHistory?: TrainingHistoryEntry[];
  message?: string;
  error?: string;
}

const HIGH_PERF_THRESHOLD = 0.7;
const LOW_PERF_THRESHOLD = 0.4;
const LR_INCREASE_FACTOR = 1.1;
const LR_DECREASE_FACTOR = 0.9;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier l'authentification admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' } as ResponseData),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' } as ResponseData),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérifier le rôle admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin role required' } as ResponseData),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting algorithm training...");

    // Récupérer les configurations actuelles
    const { data: configs, error: configsError } = await supabase
      .from("algorithm_config")
      .select("*");

    if (configsError) throw configsError;
    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No algorithm configurations found" } as ResponseData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Rafraîchir la vue matérialisée pour avoir les dernières données
    const { error: refreshError } = await supabase.rpc("refresh_algorithm_rankings");
    if (refreshError) {
      console.warn("Failed to refresh rankings:", refreshError);
    }

    // Récupérer les performances détaillées
    const { data: rankings, error: rankingsError } = await supabase
      .from("algorithm_rankings_detailed")
      .select("*")
      .order("overall_score", { ascending: false });

    if (rankingsError) throw rankingsError;
    if (!rankings || rankings.length === 0) {
      return new Response(
        JSON.stringify({ error: "No performance data available for training" } as ResponseData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log(`Found ${rankings.length} algorithm performance records`);

    const updates = [];
    const trainingHistory: TrainingHistoryEntry[] = [];

    // Pour chaque algorithme, ajuster le poids
    for (const config of configs as AlgorithmConfig[]) {
      const performances = rankings.filter((r: any) => r.model_used === config.algorithm_name) as AlgorithmPerformance[];

      const validPerformances = performances.filter(validatePerformance);
      if (validPerformances.length !== performances.length) {
        console.warn(`Invalid performances for ${config.algorithm_name}`);
        continue;
      }

      const adjustment = adjustAlgorithmConfig(config, validPerformances);
      if (adjustment) {
        console.log(`${config.algorithm_name}: ${config.weight} -> ${adjustment.newWeight} (${adjustment.improvement.toFixed(1)}%)`);

        trainingHistory.push({
          algorithm_name: config.algorithm_name,
          previous_weight: config.weight,
          new_weight: adjustment.newWeight,
          previous_parameters: config.parameters,
          new_parameters: adjustment.newParams,
          performance_improvement: adjustment.improvement,
          training_metrics: {
            avg_performance: (validPerformances.reduce((sum, p) => sum + p.avg_accuracy, 0) / validPerformances.length + validPerformances.reduce((sum, p) => sum + p.f1_score, 0) / validPerformances.length * 100) / 2 / 100,
            avg_accuracy: validPerformances.reduce((sum, p) => sum + p.avg_accuracy, 0) / validPerformances.length,
            avg_f1_score: validPerformances.reduce((sum, p) => sum + p.f1_score, 0) / validPerformances.length,
            total_evaluations: validPerformances.length,
          },
        });

        if (Math.abs(adjustment.improvement) > 1) {
          updates.push({
            id: config.id,
            weight: adjustment.newWeight,
            parameters: adjustment.newParams,
          });
        }
      }
    }

    // Enregistrer l'historique d'entraînement
    const significantHistory = trainingHistory.filter(entry => Math.abs(entry.performance_improvement) > 1);
    if (significantHistory.length > 0) {
      const { error: historyError } = await supabase
        .from("algorithm_training_history")
        .insert(significantHistory);

      if (historyError) {
        console.error("Failed to save training history:", historyError);
      }
    }

    // Appliquer les mises à jour
    const updatePromises = updates.map(update =>
      supabase
        .from("algorithm_config")
        .update({ weight: update.weight, parameters: update.parameters })
        .eq("id", update.id)
    );
    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter(result => !result.error).length;

    console.log(`Training complete. Updated ${updatedCount} algorithms.`);

    return new Response(
      JSON.stringify({
        success: true,
        trainedCount: trainingHistory.length,
        updatedCount,
        trainingHistory,
        message: `Entraînement terminé. ${updatedCount} algorithmes mis à jour sur ${trainingHistory.length} analysés.`,
      } as ResponseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in train-algorithms:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" } as ResponseData),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Valide une entrée de performance
 */
function validatePerformance(perf: AlgorithmPerformance): boolean {
  return typeof perf.avg_accuracy === 'number' && perf.avg_accuracy >= 0 && perf.avg_accuracy <= 1 &&
         typeof perf.f1_score === 'number' && perf.f1_score >= 0 && perf.f1_score <= 1;
}

/**
 * Ajuste la configuration d'un algorithme basé sur ses performances
 */
function adjustAlgorithmConfig(
  config: AlgorithmConfig,
  performances: AlgorithmPerformance[]
): { newWeight: number; newParams: Record<string, any>; improvement: number } | null {
  if (performances.length === 0) return null;

  const avgAccuracy = performances.reduce((sum, p) => sum + p.avg_accuracy, 0) / performances.length;
  const avgF1 = performances.reduce((sum, p) => sum + p.f1_score, 0) / performances.length;
  const avgPerformance = (avgAccuracy + avgF1 * 100) / 2 / 100;

  const newWeight = Math.min(1, Math.max(0.1, config.weight * (1 + (avgPerformance - 0.5) * 0.2)));
  const improvement = ((newWeight - config.weight) / config.weight) * 100;

  const newParams = { ...config.parameters };
  
  // Auto-ajustement basique des hyperparamètres
  if (avgPerformance > HIGH_PERF_THRESHOLD) {
    // Performance élevée: augmenter légèrement la complexité
    if (newParams.learningRate) newParams.learningRate *= LR_INCREASE_FACTOR;
    if (newParams.numEstimators) newParams.numEstimators = Math.min(50, newParams.numEstimators + 2);
  } else if (avgPerformance < LOW_PERF_THRESHOLD) {
    // Performance faible: réduire la complexité
    if (newParams.learningRate) newParams.learningRate *= LR_DECREASE_FACTOR;
    if (newParams.numEstimators) newParams.numEstimators = Math.max(5, newParams.numEstimators - 2);
  }

  return { newWeight, newParams, improvement };
}