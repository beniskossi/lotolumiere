import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { drawName } = await req.json();

    console.log(`Evaluating predictions for: ${drawName || "all draws"}`);

    // Get all draw results
    let resultsQuery = supabase
      .from("draw_results")
      .select("id, draw_name, draw_date, winning_numbers");

    if (drawName) {
      resultsQuery = resultsQuery.eq("draw_name", drawName);
    }

    const { data: results, error: resultsError } = await resultsQuery;

    if (resultsError) throw resultsError;
    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ message: "No results found to evaluate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${results.length} draw results to evaluate`);

    let evaluatedCount = 0;

    // For each result, find predictions made before the draw date
    for (const result of results as DrawResult[]) {
      const { data: predictions, error: predictionsError } = await supabase
        .from("predictions")
        .select("id, draw_name, prediction_date, predicted_numbers, model_used")
        .eq("draw_name", result.draw_name)
        .lte("prediction_date", result.draw_date);

      if (predictionsError) {
        console.error(`Error fetching predictions: ${predictionsError.message}`);
        continue;
      }

      if (!predictions || predictions.length === 0) continue;

      // Evaluate each prediction
      for (const prediction of predictions as Prediction[]) {
        // Count matches
        const matches = prediction.predicted_numbers.filter((num) =>
          result.winning_numbers.includes(num)
        ).length;

        // Calculate accuracy score (0-100)
        const accuracyScore = (matches / 5) * 100;

        // Insert or update performance record
        const { error: insertError } = await supabase
          .from("algorithm_performance")
          .upsert({
            draw_name: result.draw_name,
            model_used: prediction.model_used,
            prediction_date: prediction.prediction_date,
            draw_date: result.draw_date,
            predicted_numbers: prediction.predicted_numbers,
            winning_numbers: result.winning_numbers,
            matches_count: matches,
            accuracy_score: accuracyScore,
          }, {
            onConflict: "draw_name,model_used,prediction_date,draw_date"
          });

        if (insertError) {
          console.error(`Error inserting performance: ${insertError.message}`);
        } else {
          evaluatedCount++;
        }
      }
    }

    console.log(`Successfully evaluated ${evaluatedCount} predictions`);

    return new Response(
      JSON.stringify({
        success: true,
        evaluatedCount,
        message: `Evaluated ${evaluatedCount} predictions`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in evaluate-predictions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
