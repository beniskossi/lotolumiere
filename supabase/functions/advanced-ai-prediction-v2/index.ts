import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { DrawResult, PredictionResult } from "../_shared/types.ts";
import { dataCache, predictionCache } from "../_shared/cache.ts";
import { log, calculateDataQuality, calculateFreshness } from "../_shared/utils.ts";
import {
  weightedFrequencyAlgorithm,
  kmeansClusteringAlgorithm,
  bayesianInferenceAlgorithm,
  neuralNetworkAlgorithm,
  varianceAnalysisAlgorithm,
  randomForestAlgorithm,
  gradientBoostingAlgorithm,
  lstmAlgorithm,
  arimaAlgorithm,
  generateFallbackPrediction,
} from "../_shared/algorithms.ts";
import { ensemblePrediction } from "../_shared/ensemble.ts";
import { explainPrediction } from "../_shared/explainability.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DATA_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const PREDICTION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface PredictionResponse {
  predictions: PredictionResult[];
  explanations?: any[];
  warning?: string;
}

interface AlgorithmConfig {
  name: string;
  type: string;
  fn: (results: DrawResult[]) => PredictionResult;
}

const algorithms: AlgorithmConfig[] = [
  { name: "Ensemble (7 modèles)", type: "ensemble", fn: ensemblePrediction },
  { name: "Analyse Fréquentielle", type: "statistical", fn: weightedFrequencyAlgorithm },
  { name: "Inférence Bayésienne", type: "bayesian", fn: bayesianInferenceAlgorithm },
  { name: "Neural Network", type: "neural", fn: neuralNetworkAlgorithm },
  { name: "Random Forest", type: "lightgbm", fn: randomForestAlgorithm },
  { name: "Gradient Boosting", type: "catboost", fn: gradientBoostingAlgorithm },
  { name: "LSTM Network", type: "transformer", fn: lstmAlgorithm },
  { name: "ARIMA", type: "arima", fn: arimaAlgorithm },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { drawName } = await req.json();

    if (!drawName || !validateDrawName(drawName)) {
      throw new Error("Invalid drawName");
    }

    log("info", `Generating advanced predictions for ${drawName}`, { drawName });

    // Vérifier le cache d'abord
    const cacheKey = `predictions_${drawName}_v2`;
    const cached = predictionCache.get(cacheKey);
    if (cached) {
      log("info", `Cache hit for predictions for ${drawName}`, { drawName, elapsed: Date.now() - startTime });
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les données historiques
    const results = await fetchHistoricalData(drawName);
    
    if (!results || results.length === 0) {
      log("warn", `No data available for ${drawName}`, { drawName });
      const fallbackResponse = generateFallbackResponse(drawName);
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    log("info", `Data fetched for ${drawName}`, { drawName, count: results.length });

    // Calculer les métriques de qualité
    const dataQuality = calculateDataQuality(results);
    const freshness = calculateFreshness(results);

    // Générer les prédictions avec tous les algorithmes
    const predictions = await generateAllPredictions(results, dataQuality, freshness);

    // Générer explications pour top prédiction
    const explanations = predictions.length > 0 ? explainPrediction(predictions[0], results) : [];

    // Construire la réponse
    const response: PredictionResponse = { predictions, explanations };
    
    // Ajouter des avertissements si nécessaire
    if (results.length < 20) {
      response.warning = `Données limitées (${results.length} tirages) - Prédictions avec confiance réduite`;
    } else if (dataQuality < 0.5) {
      response.warning = `Qualité des données faible (${(dataQuality * 100).toFixed(0)}%) - Résultats moins fiables`;
    } else if (freshness < 0.5) {
      response.warning = `Données anciennes - Prédictions moins précises`;
    }

    // Mettre en cache
    predictionCache.set(cacheKey, response, PREDICTION_CACHE_TTL);

    const elapsed = Date.now() - startTime;
    log("info", `Predictions generated for ${drawName}`, { drawName, count: predictions.length, elapsed });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log("error", "Prediction error", { error: error instanceof Error ? error.message : error });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Valide le nom du tirage
 */
function validateDrawName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Récupère les données historiques depuis Supabase avec cache
 */
async function fetchHistoricalData(drawName: string): Promise<DrawResult[]> {
  const cacheKey = `data_${drawName}_v2`;
  const cached = dataCache.get(cacheKey);
  if (cached) {
    log("info", `Cache hit for data for ${drawName}`, { drawName });
    return cached;
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: results, error } = await supabase
    .from('draw_results')
    .select('draw_name, draw_date, winning_numbers')
    .eq('draw_name', drawName)
    .order('draw_date', { ascending: false })
    .limit(300);

  if (error) {
    log("error", `Database error for ${drawName}`, { drawName, error: error.message });
    throw error;
  }

  const drawResults = (results || []) as DrawResult[];
  
  // Mettre en cache
  dataCache.set(cacheKey, drawResults, DATA_CACHE_TTL);

  return drawResults;
}

/**
 * Génère toutes les prédictions avec tous les algorithmes
 */
async function generateAllPredictions(
  results: DrawResult[],
  dataQuality: number,
  freshness: number
): Promise<PredictionResult[]> {
  // Si vraiment pas assez de données, retourner des fallbacks
  if (results.length < 5) {
    return generateAllFallbacks();
  }

  const algorithmPromises = algorithms.map(async (algo) => {
    try {
      return algo.fn(results);
    } catch (e) {
      log("warn", `${algo.name} algorithm failed`, { error: e });
      return generateFallbackPrediction(algo.name, algo.type);
    }
  });

  const predictions = (await Promise.allSettled(algorithmPromises))
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<PredictionResult>).value);

  // Ajuster les scores en fonction de la qualité des données
  predictions.forEach(pred => {
    pred.confidence *= (0.5 + dataQuality * 0.3 + freshness * 0.2);
    pred.score *= (0.5 + dataQuality * 0.3 + freshness * 0.2);
  });

  // Trier par score décroissant
  return predictions.sort((a, b) => b.score - a.score);
}

/**
 * Génère une réponse en mode dégradé
 */
function generateFallbackResponse(drawName: string): PredictionResponse {
  return {
    predictions: generateAllFallbacks(),
    warning: "Aucune donnée historique - Prédictions générées en mode dégradé"
  };
}

/**
 * Génère toutes les prédictions en mode fallback
 */
function generateAllFallbacks(): PredictionResult[] {
  return algorithms.map(algo => generateFallbackPrediction(algo.name, algo.type));
}