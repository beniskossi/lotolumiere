import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configuration
const CONFIG = {
  CORS_HEADERS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  },
  BATCH_SIZE: 100,
  MAX_EVALUATIONS_PER_RUN: 10000,
  LOG_LEVEL: "info", // debug, info, warn, error
  VALIDATION: {
    MAX_DRAW_NAME_LENGTH: 100,
    ALLOWED_DATE_FORMATS: ["YYYY-MM-DD"],
  },
} as const;

interface DrawResult {
  id: string;
  draw_name: string;
  draw_date: string;
  winning_numbers: number[];
}

interface Prediction {
  id: string;
  draw_name: string;
  prediction_date: string;
  predicted_numbers: number[];
  model_used: string;
  confidence_score?: number;
  execution_time?: number;
  meta?: Record<string, any>;
}

interface EvaluationResult {
  success: boolean;
  evaluatedCount: number;
  newEvaluations: number;
  algorithmStats: Record<string, { evaluated: number; bestMatch: number; avgAccuracy: number }>;
  message: string;
  performanceMetrics?: {
    totalProcessingTime: number;
    averageProcessingTime: number;
    errors: number;
  };
}

// Validation utils
function validateDrawName(drawName: string | undefined): boolean {
  if (!drawName) return true; // undefined is allowed
  return typeof drawName === 'string' && 
         drawName.length > 0 && 
         drawName.length <= CONFIG.VALIDATION.MAX_DRAW_NAME_LENGTH &&
         /^[a-zA-Z0-9_-]+$/.test(drawName); // Sécurité : format valide
}

function validateDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function validateNumbers(numbers: number[], maxNum: number = 90): boolean {
  if (!Array.isArray(numbers) || numbers.length === 0) return false;
  return numbers.every(num => 
    typeof num === 'number' && 
    Number.isInteger(num) && 
    num >= 1 && 
    num <= maxNum
  );
}

// Calcul d'exactitude amélioré
function calculateAccuracy(
  predicted: number[], 
  actual: number[], 
  expectedCount: number = 5
): { matches: number; accuracy: number; precision: number; recall: number } {
  if (!predicted || !actual) {
    return { matches: 0, accuracy: 0, precision: 0, recall: 0 };
  }

  const predictedSet = new Set(predicted);
  const actualSet = new Set(actual);
  
  const matches = actual.filter(num => predictedSet.has(num)).length;
  const precision = predicted.length > 0 ? matches / predicted.length : 0;
  const recall = actual.length > 0 ? matches / actual.length : 0;
  const accuracy = (matches / expectedCount) * 100;

  return { matches, accuracy, precision, recall };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CONFIG.CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: CONFIG.CORS_HEADERS }
    );
  }

  const startTime = performance.now();

  try {
    // Parse and validate request body
    const requestBody = await req.json();
    const { drawName, force = false, validateOnly = false, batchSize = CONFIG.BATCH_SIZE } = requestBody;

    // Validation des paramètres
    if (!validateDrawName(drawName)) {
      return new Response(
        JSON.stringify({ error: "Invalid drawName format" }),
        { status: 400, headers: CONFIG.CORS_HEADERS }
      );
    }

    console.log(`🔍 Evaluating predictions for: ${drawName || "all draws"}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all draw results sorted by date (most recent first)
    let resultsQuery = supabase
      .from("draw_results")
      .select("id, draw_name, draw_date, winning_numbers")
      .order("draw_date", { ascending: false });

    if (drawName) {
      resultsQuery = resultsQuery.eq("draw_name", drawName);
    }

    const { data: results, error: resultsError } = await resultsQuery;

    if (resultsError) {
      console.error(`❌ Error fetching results: ${resultsError.message}`);
      throw resultsError;
    }

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No results found to evaluate",
          evaluatedCount: 0,
          newEvaluations: 0,
          success: true
        }),
        { headers: CONFIG.CORS_HEADERS }
      );
    }

    console.log(`📊 Found ${results.length} draw results to evaluate`);

    let evaluatedCount = 0;
    let newEvaluations = 0;
    let errorCount = 0;
    const algorithmStats: Record<string, { evaluated: number; bestMatch: number; totalAccuracy: number }> = {};

    // Process results in batches to avoid timeouts
    const resultBatches = [];
    for (let i = 0; i < results.length; i += batchSize) {
      resultBatches.push(results.slice(i, i + batchSize));
    }

    for (const resultBatch of resultBatches) {
      // For each result in batch, find ALL predictions made before the draw date
      for (const result of resultBatch as DrawResult[]) {
        if (evaluatedCount >= CONFIG.MAX_EVALUATIONS_PER_RUN) {
          console.log(`⚠️ Maximum evaluations limit reached: ${CONFIG.MAX_EVALUATIONS_PER_RUN}`);
          break;
        }

        console.log(`\n🎯 Processing draw: ${result.draw_name} on ${result.draw_date}`);
        
        if (!validateDate(result.draw_date)) {
          console.error(`❌ Invalid date format: ${result.draw_date}`);
          errorCount++;
          continue;
        }

        if (!validateNumbers(result.winning_numbers)) {
          console.error(`❌ Invalid winning numbers: ${result.winning_numbers}`);
          errorCount++;
          continue;
        }

        // Get ALL predictions for this draw made before the result date
        const { data: predictions, error: predictionsError } = await supabase
          .from("predictions")
          .select("id, draw_name, prediction_date, predicted_numbers, model_used, confidence_score, execution_time, meta")
          .eq("draw_name", result.draw_name)
          .lte("prediction_date", result.draw_date)
          .order("prediction_date", { ascending: false });

        if (predictionsError) {
          console.error(`❌ Error fetching predictions: ${predictionsError.message}`);
          errorCount++;
          continue;
        }

        if (!predictions || predictions.length === 0) {
          console.log(`⚠️ No predictions found for ${result.draw_name} before ${result.draw_date}`);
          continue;
        }

        console.log(`📈 Found ${predictions.length} predictions to evaluate`);

        // Evaluate each prediction
        for (const prediction of predictions as Prediction[]) {
          try {
            // Validation des données de prédiction
            if (!validateNumbers(prediction.predicted_numbers)) {
              console.error(`❌ Invalid predicted numbers: ${prediction.predicted_numbers}`);
              errorCount++;
              continue;
            }

            // Calcul d'exactitude
            const { matches, accuracy, precision, recall } = calculateAccuracy(
              prediction.predicted_numbers,
              result.winning_numbers
            );

            // Calcul des métriques additionnelles
            const confidence = prediction.confidence_score || accuracy / 100;
            const score = accuracy; // 0-100

            // Track algorithm stats
            const algo = prediction.model_used;
            if (!algorithmStats[algo]) {
              algorithmStats[algo] = { evaluated: 0, bestMatch: 0, totalAccuracy: 0 };
            }
            algorithmStats[algo].evaluated++;
            algorithmStats[algo].bestMatch = Math.max(algorithmStats[algo].bestMatch, matches);
            algorithmStats[algo].totalAccuracy += accuracy;

            // Check if evaluation already exists
            const { data: existing } = await supabase
              .from("algorithm_performance")
              .select("id")
              .eq("draw_name", result.draw_name)
              .eq("model_used", prediction.model_used)
              .eq("prediction_date", prediction.prediction_date)
              .eq("draw_date", result.draw_date)
              .single();

            // Insert or update performance record
            const performanceRecord = {
              draw_name: result.draw_name,
              model_used: prediction.model_used,
              prediction_date: prediction.prediction_date,
              draw_date: result.draw_date,
              predicted_numbers: prediction.predicted_numbers,
              winning_numbers: result.winning_numbers,
              matches_count: matches,
              accuracy_score: accuracy,
              confidence_score: confidence,
              precision_score: precision,
              recall_score: recall,
              f1_score: precision > 0 && recall > 0 ? (2 * precision * recall) / (precision + recall) : 0,
              execution_time: prediction.execution_time,
              data_points_used: Array.isArray(prediction.meta?.data_points_used) 
                ? prediction.meta.data_points_used.length 
                : prediction.meta?.data_points_used || null,
              prediction_score: score,
              factors: prediction.meta?.factors || [],
              created_at: new Date().toISOString(),
            };

            const { error: insertError } = await supabase
              .from("algorithm_performance")
              .upsert(performanceRecord, {
                onConflict: "draw_name,model_used,prediction_date,draw_date"
              });

            if (insertError) {
              console.error(`❌ Error inserting performance: ${insertError.message}`);
              errorCount++;
            } else {
              evaluatedCount++;
              if (!existing) {
                newEvaluations++;
                if (CONFIG.LOG_LEVEL === "debug") {
                  console.log(`✅ ${prediction.model_used}: ${matches}/5 matches (${accuracy.toFixed(1)}%)`);
                }
              }
            }
          } catch (evalError) {
            console.error(`❌ Error evaluating prediction:`, evalError);
            errorCount++;
          }
        }
      }
    }

    // Calculate average accuracy for each algorithm
    const finalAlgorithmStats: Record<string, { evaluated: number; bestMatch: number; avgAccuracy: number }> = {};
    Object.entries(algorithmStats).forEach(([algo, stats]) => {
      finalAlgorithmStats[algo] = {
        evaluated: stats.evaluated,
        bestMatch: stats.bestMatch,
        avgAccuracy: stats.evaluated > 0 ? stats.totalAccuracy / stats.evaluated : 0,
      };
    });

    // Refresh materialized views to update rankings
    console.log("\n🔄 Refreshing algorithm rankings...");
    const { error: refreshError } = await supabase.rpc("refresh_algorithm_rankings");
    if (refreshError) {
      console.error(`⚠️ Warning: Could not refresh rankings: ${refreshError.message}`);
    } else {
      console.log("✅ Rankings refreshed successfully");
    }

    // Log summary by algorithm
    console.log("\n📊 Evaluation Summary by Algorithm:");
    Object.entries(finalAlgorithmStats).forEach(([algo, stats]) => {
      console.log(`  • ${algo}: ${stats.evaluated} evaluations, best: ${stats.bestMatch}/5, avg: ${stats.avgAccuracy.toFixed(2)}%`);
    });

    const endTime = performance.now();
    const totalProcessingTime = endTime - startTime;
    const averageProcessingTime = evaluatedCount > 0 ? totalProcessingTime / evaluatedCount : 0;

    console.log(`\n🎉 Successfully evaluated ${evaluatedCount} predictions (${newEvaluations} new) in ${totalProcessingTime.toFixed(2)}ms`);

    const result: EvaluationResult = {
      success: true,
      evaluatedCount,
      newEvaluations,
      algorithmStats: finalAlgorithmStats,
      message: `Evaluated ${evaluatedCount} predictions (${newEvaluations} new)`,
      performanceMetrics: {
        totalProcessingTime,
        averageProcessingTime,
        errors: errorCount,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: CONFIG.CORS_HEADERS,
    });

  } catch (error) {
    console.error("❌ Error in evaluate-predictions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        status: 500,
        headers: CONFIG.CORS_HEADERS,
      }
    );
  }
});