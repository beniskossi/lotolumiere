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
  lightGBMAlgorithm,
  catBoostAlgorithm,
  transformerAlgorithm,
  arimaAlgorithm,
  generateFallbackPrediction,
} from "../_shared/algorithms.ts";

// Configuration
const CONFIG = {
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  },
  CACHE_TTL: {
    PREDICTIONS: 5 * 60 * 1000, // 5 minutes
    DATA: 10 * 60 * 1000,      // 10 minutes
  },
  DATABASE: {
    LIMIT: 300,
    MIN_DATA_POINTS: 5,
    MIN_DATA_POINTS_FOR_PREDICTIONS: 20,
  },
  LOGGING: {
    ENABLED: true,
  },
} as const;

// Types pour les algorithmes
type AlgorithmFunction = (results: DrawResult[]) => PredictionResult;

interface AlgorithmConfig {
  name: string;
  category: PredictionResult['category'];
  algorithm: AlgorithmFunction;
}

// Configuration des algorithmes
const ALGORITHMS: AlgorithmConfig[] = [
  { name: "Analyse Fréquentielle", category: "statistical", algorithm: weightedFrequencyAlgorithm },
  { name: "ML K-means", category: "ml", algorithm: kmeansClusteringAlgorithm },
  { name: "Inférence Bayésienne", category: "bayesian", algorithm: bayesianInferenceAlgorithm },
  { name: "Neural Network", category: "neural", algorithm: neuralNetworkAlgorithm },
  { name: "Analyse Variance", category: "variance", algorithm: varianceAnalysisAlgorithm },
  { name: "LightGBM", category: "lightgbm", algorithm: lightGBMAlgorithm },
  { name: "CatBoost", category: "catboost", algorithm: catBoostAlgorithm },
  { name: "Transformer", category: "transformer", algorithm: transformerAlgorithm },
  { name: "ARIMA", category: "arima", algorithm: arimaAlgorithm },
];

// Réponse de l'API
interface ApiResponse {
  predictions: PredictionResult[];
  warning?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CONFIG.CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: CONFIG.CORS_HEADERS }
    );
  }

  const startTime = Date.now();

  try {
    const requestBody = await req.json();
    
    // Validation du corps de la requête
    const { drawName } = validateRequestBody(requestBody);

    log("info", "Generating advanced predictions", { drawName });

    // Vérifier le cache d'abord
    const cacheKey = `predictions_${drawName}_v2`;
    const cached = predictionCache.get(cacheKey);
    if (cached) {
      log("info", "Cache hit for predictions", { 
        drawName, 
        elapsed: Date.now() - startTime 
      });
      return new Response(JSON.stringify(cached), {
        headers: CONFIG.CORS_HEADERS,
      });
    }

    // Récupérer les données historiques
    const results = await fetchHistoricalData(drawName);
    
    if (!results || results.length === 0) {
      log("warn", "No data available", { drawName });
      const fallbackResponse = generateFallbackResponse(drawName);
      return new Response(JSON.stringify(fallbackResponse), {
        headers: CONFIG.CORS_HEADERS,
      });
    }

    log("info", "Data fetched", { drawName, count: results.length });

    // Calculer les métriques de qualité
    const dataQuality = calculateDataQuality(results);
    const freshness = calculateFreshness(results);

    // Générer les prédictions avec tous les algorithmes
    const predictions = await generateAllPredictions(results, dataQuality, freshness);

    // Construire la réponse
    const response: ApiResponse = { predictions };
    
    // Ajouter des avertissements si nécessaire
    addWarnings(response, results, dataQuality, freshness);

    // Mettre en cache
    predictionCache.set(cacheKey, response, CONFIG.CACHE_TTL.PREDICTIONS);

    const elapsed = Date.now() - startTime;
    log("info", "Predictions generated", { 
      drawName, 
      count: predictions.length, 
      elapsed 
    });

    return new Response(JSON.stringify(response), {
      headers: CONFIG.CORS_HEADERS,
    });
  } catch (error) {
    log("error", "Prediction error", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: CONFIG.CORS_HEADERS,
    });
  }
});

/**
 * Valide le corps de la requête
 */
function validateRequestBody(body: unknown): { drawName: string } {
  if (!body || typeof body !== 'object') {
    throw new Error("Invalid request body");
  }

  const { drawName } = body as Record<string, unknown>;
  
  if (!drawName || typeof drawName !== 'string' || drawName.trim().length === 0) {
    throw new Error("drawName is required and must be a non-empty string");
  }

  if (drawName.length > 100) {
    throw new Error("drawName is too long (max 100 characters)");
  }

  return { drawName: drawName.trim() };
}

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
    .limit(CONFIG.DATABASE.LIMIT);

  if (error) {
    log("error", "Database error", { drawName, error: error.message });
    throw error;
  }

  const drawResults = (results || []) as DrawResult[];
  
  // Mettre en cache
  dataCache.set(cacheKey, drawResults, CONFIG.CACHE_TTL.DATA);

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
  if (results.length < CONFIG.DATABASE.MIN_DATA_POINTS) {
    return generateAllFallbacks();
  }

  const predictions: PredictionResult[] = [];

  // Exécuter tous les algorithmes avec gestion d'erreur
  for (const { name, category, algorithm } of ALGORITHMS) {
    try {
      const prediction = await executeAlgorithm(algorithm, results);
      predictions.push(prediction);
    } catch (error) {
      log("warn", `${name} algorithm failed`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      predictions.push(generateFallbackPrediction(name, category));
    }
  }

  // Ajuster les scores en fonction de la qualité des données
  adjustScores(predictions, dataQuality, freshness);

  // Trier par score décroissant
  return predictions.sort((a, b) => b.score - a.score);
}

/**
 * Exécute un algorithme avec timeout
 */
async function executeAlgorithm(
  algorithm: AlgorithmFunction, 
  results: DrawResult[]
): Promise<PredictionResult> {
  // Utilisation d'un timeout pour éviter les algorithmes qui prennent trop de temps
  return Promise.race([
    algorithm(results),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Algorithm timeout')), 10000) // 10 secondes
    )
  ]);
}

/**
 * Ajuste les scores en fonction de la qualité des données
 */
function adjustScores(
  predictions: PredictionResult[], 
  dataQuality: number, 
  freshness: number
): void {
  const qualityMultiplier = 0.5 + dataQuality * 0.3 + freshness * 0.2;
  
  for (const pred of predictions) {
    pred.confidence = Math.max(0, Math.min(1, pred.confidence * qualityMultiplier));
    pred.score = Math.max(0, Math.min(100, pred.score * qualityMultiplier));
  }
}

/**
 * Ajoute des avertissements à la réponse
 */
function addWarnings(
  response: ApiResponse,
  results: DrawResult[],
  dataQuality: number,
  freshness: number
): void {
  if (results.length < CONFIG.DATABASE.MIN_DATA_POINTS_FOR_PREDICTIONS) {
    response.warning = `Données limitées (${results.length} tirages) - Prédictions avec confiance réduite`;
  } else if (dataQuality < 0.5) {
    response.warning = `Qualité des données faible (${(dataQuality * 100).toFixed(0)}%) - Résultats moins fiables`;
  } else if (freshness < 0.5) {
    response.warning = `Données anciennes - Prédictions moins précises`;
  }
}

/**
 * Génère une réponse en mode dégradé
 */
function generateFallbackResponse(drawName: string): ApiResponse {
  return {
    predictions: generateAllFallbacks(),
    warning: "Aucune donnée historique - Prédictions générées en mode dégradé"
  };
}

/**
 * Génère toutes les prédictions en mode fallback
 */
function generateAllFallbacks(): PredictionResult[] {
  return ALGORITHMS.map(({ name, category }) => 
    generateFallbackPrediction(name, category)
  );
}

// Export pour tests (optionnel)
if (import.meta.main) {
  console.log("Server running with improved prediction API");
}