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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { drawName } = await req.json();

    if (!drawName) {
      throw new Error("drawName is required");
    }

    log("info", "Generating advanced predictions", { drawName });

    // Vérifier le cache d'abord
    const cacheKey = `predictions_${drawName}_v2`;
    const cached = predictionCache.get(cacheKey);
    if (cached) {
      log("info", "Cache hit for predictions", { drawName, elapsed: Date.now() - startTime });
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les données historiques
    const results = await fetchHistoricalData(drawName);
    
    if (!results || results.length === 0) {
      log("warn", "No data available", { drawName });
      const fallbackResponse = generateFallbackResponse(drawName);
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    log("info", "Data fetched", { drawName, count: results.length });

    // Calculer les métriques de qualité
    const dataQuality = calculateDataQuality(results);
    const freshness = calculateFreshness(results);

    // Générer les prédictions avec tous les algorithmes
    const predictions = await generateAllPredictions(results, dataQuality, freshness);

    // Construire la réponse
    const response: any = { predictions };
    
    // Ajouter des avertissements si nécessaire
    if (results.length < 20) {
      response.warning = `Données limitées (${results.length} tirages) - Prédictions avec confiance réduite`;
    } else if (dataQuality < 0.5) {
      response.warning = `Qualité des données faible (${(dataQuality * 100).toFixed(0)}%) - Résultats moins fiables`;
    } else if (freshness < 0.5) {
      response.warning = `Données anciennes - Prédictions moins précises`;
    }

    // Mettre en cache (5 minutes)
    predictionCache.set(cacheKey, response, 5 * 60 * 1000);

    const elapsed = Date.now() - startTime;
    log("info", "Predictions generated", { drawName, count: predictions.length, elapsed });

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
 * Récupère les données historiques depuis Supabase avec cache
 */
async function fetchHistoricalData(drawName: string): Promise<DrawResult[]> {
  const cacheKey = `data_${drawName}_v2`;
  const cached = dataCache.get(cacheKey);
  if (cached) {
    log("info", "Cache hit for data", { drawName });
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
    log("error", "Database error", { drawName, error: error.message });
    throw error;
  }

  const drawResults = (results || []) as DrawResult[];
  
  // Mettre en cache (10 minutes)
  dataCache.set(cacheKey, drawResults, 10 * 60 * 1000);

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

  const predictions: PredictionResult[] = [];

  try {
    // Algorithme 1: Fréquence pondérée
    predictions.push(weightedFrequencyAlgorithm(results));
  } catch (e) {
    log("warn", "Frequency algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("Analyse Fréquentielle", "statistical"));
  }

  try {
    // Algorithme 2: K-means
    predictions.push(kmeansClusteringAlgorithm(results));
  } catch (e) {
    log("warn", "K-means algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("ML K-means", "ml"));
  }

  try {
    // Algorithme 3: Bayésien
    predictions.push(bayesianInferenceAlgorithm(results));
  } catch (e) {
    log("warn", "Bayesian algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("Inférence Bayésienne", "bayesian"));
  }

  try {
    // Algorithme 4: Neural Network
    predictions.push(neuralNetworkAlgorithm(results));
  } catch (e) {
    log("warn", "Neural algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("Neural Network", "neural"));
  }

  try {
    // Algorithme 5: Variance
    predictions.push(varianceAnalysisAlgorithm(results));
  } catch (e) {
    log("warn", "Variance algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("Analyse Variance", "variance"));
  }

  try {
    // Algorithme 6: Random Forest
    predictions.push(randomForestAlgorithm(results));
  } catch (e) {
    log("warn", "Random Forest algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("Random Forest", "lightgbm"));
  }

  try {
    // Algorithme 7: Gradient Boosting
    predictions.push(gradientBoostingAlgorithm(results));
  } catch (e) {
    log("warn", "Gradient Boosting algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("Gradient Boosting", "catboost"));
  }

  try {
    // Algorithme 8: LSTM Network
    predictions.push(lstmAlgorithm(results));
  } catch (e) {
    log("warn", "LSTM algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("LSTM Network", "transformer"));
  }

  try {
    // Algorithme 9: ARIMA
    predictions.push(arimaAlgorithm(results));
  } catch (e) {
    log("warn", "ARIMA algorithm failed", { error: e });
    predictions.push(generateFallbackPrediction("ARIMA", "arima"));
  }

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
function generateFallbackResponse(drawName: string) {
  return {
    predictions: generateAllFallbacks(),
    warning: "Aucune donnée historique - Prédictions générées en mode dégradé"
  };
}

/**
 * Génère toutes les prédictions en mode fallback
 */
function generateAllFallbacks(): PredictionResult[] {
  return [
    generateFallbackPrediction("Analyse Fréquentielle", "statistical"),
    generateFallbackPrediction("ML K-means", "ml"),
    generateFallbackPrediction("Inférence Bayésienne", "bayesian"),
    generateFallbackPrediction("Neural Network", "neural"),
    generateFallbackPrediction("Analyse Variance", "variance"),
    generateFallbackPrediction("LightGBM", "lightgbm"),
    generateFallbackPrediction("CatBoost", "catboost"),
    generateFallbackPrediction("Transformer", "transformer"),
    generateFallbackPrediction("ARIMA", "arima"),
  ];
}
