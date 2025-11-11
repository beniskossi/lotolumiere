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
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
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
        JSON.stringify({ error: 'Forbidden - Admin role required' }),
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
        JSON.stringify({ error: "No algorithm configurations found" }),
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
        JSON.stringify({ error: "No performance data available for training" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log(`Found ${rankings.length} algorithm performance records`);

    const updates = [];
    const trainingHistory = [];

    // Pour chaque algorithme, ajuster le poids
    for (const config of configs as AlgorithmConfig[]) {
      const performances = rankings.filter((r: any) => r.model_used === config.algorithm_name) as AlgorithmPerformance[];

      if (performances.length === 0) continue;

      // Calculs pour poids
      const avgAccuracy = performances.reduce((sum, p) => sum + p.avg_accuracy, 0) / performances.length;
      const avgF1 = performances.reduce((sum, p) => sum + p.f1_score, 0) / performances.length;
      const avgPerformance = (avgAccuracy + avgF1 * 100) / 2 / 100;

      const newWeight = Math.min(1, Math.max(0.1, config.weight * (1 + (avgPerformance - 0.5) * 0.2)));
      const improvement = ((newWeight - config.weight) / config.weight) * 100;

      console.log(`${config.algorithm_name}: ${config.weight} -> ${newWeight} (${improvement.toFixed(1)}%)`);

      // Ajuster les paramètres basé sur performance
      const newParams = { ...config.parameters };
      
      // Auto-ajustement basique des hyperparamètres
      if (avgPerformance > 0.7) {
        // Performance élevée: augmenter légèrement la complexité
        if (newParams.learningRate) newParams.learningRate *= 1.1;
        if (newParams.numEstimators) newParams.numEstimators = Math.min(50, newParams.numEstimators + 2);
      } else if (avgPerformance < 0.4) {
        // Performance faible: réduire la complexité
        if (newParams.learningRate) newParams.learningRate *= 0.9;
        if (newParams.numEstimators) newParams.numEstimators = Math.max(5, newParams.numEstimators - 2);
      }

      // Enregistrer l'historique d'entraînement
      trainingHistory.push({
        algorithm_name: config.algorithm_name,
        previous_weight: config.weight,
        new_weight: newWeight,
        previous_parameters: config.parameters,
        new_parameters: newParams,
        performance_improvement: improvement,
        training_metrics: {
          avg_performance: avgPerformance,
          avg_accuracy: avgAccuracy,
          avg_f1_score: avgF1,
          total_evaluations: performances.length,
        },
      });

      // Si le poids a changé de manière significative (>1%), mettre à jour
      if (Math.abs(improvement) > 1) {
        updates.push({
          id: config.id,
          weight: newWeight,
          parameters: newParams,
        });
      }
    }

    // Enregistrer l'historique d'entraînement
    if (trainingHistory.length > 0) {
      const { error: historyError } = await supabase
        .from("algorithm_training_history")
        .insert(trainingHistory);

      if (historyError) {
        console.error("Failed to save training history:", historyError);
      }
    }

    // Appliquer les mises à jour
    let updatedCount = 0;
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("algorithm_config")
        .update({ weight: update.weight, parameters: update.parameters })
        .eq("id", update.id);

      if (updateError) {
        console.error(`Failed to update ${update.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    console.log(`Training complete. Updated ${updatedCount} algorithms.`);

    return new Response(
      JSON.stringify({
        success: true,
        trainedCount: trainingHistory.length,
        updatedCount,
        trainingHistory,
        message: `Entraînement terminé. ${updatedCount} algorithmes mis à jour sur ${trainingHistory.length} analysés.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in train-algorithms:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
