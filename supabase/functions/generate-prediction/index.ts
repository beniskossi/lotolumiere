import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HistoricalDraw {
  draw_date: string;
  winning_numbers: number[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawName } = await req.json();
    
    if (!drawName) {
      return new Response(
        JSON.stringify({ error: "Draw name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating prediction for:", drawName);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch historical data (last 100 draws)
    const { data: historicalData, error: fetchError } = await supabase
      .from("draw_results")
      .select("draw_date, winning_numbers")
      .eq("draw_name", drawName)
      .order("draw_date", { ascending: false })
      .limit(100);

    if (fetchError) {
      console.error("Error fetching historical data:", fetchError);
      throw fetchError;
    }

    if (!historicalData || historicalData.length < 10) {
      return new Response(
        JSON.stringify({ 
          error: "Insufficient historical data", 
          message: "At least 10 historical draws are required for predictions" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${historicalData.length} historical draws`);

    // Multi-model approach simulation
    const frequencyPrediction = predictByFrequency(historicalData as HistoricalDraw[]);
    const sequencePrediction = predictBySequence(historicalData as HistoricalDraw[]);
    const gapAnalysisPrediction = predictByGapAnalysis(historicalData as HistoricalDraw[]);

    // Combine predictions with weighted average (simulating ensemble approach)
    const combinedPrediction = combineModels([
      { numbers: frequencyPrediction, weight: 0.4 },
      { numbers: sequencePrediction, weight: 0.35 },
      { numbers: gapAnalysisPrediction, weight: 0.25 }
    ]);

    // Calculate confidence score
    const confidenceScore = calculateConfidence(historicalData as HistoricalDraw[], combinedPrediction);

    // Store prediction in database
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const predictionDate = tomorrow.toISOString().split("T")[0];

    const { error: insertError } = await supabase
      .from("predictions")
      .upsert({
        draw_name: drawName,
        prediction_date: predictionDate,
        predicted_numbers: combinedPrediction,
        confidence_score: confidenceScore,
        model_used: "Hybrid (LightGBM-like + CatBoost-like + Transformers-like)",
        model_metadata: {
          historical_draws_analyzed: historicalData.length,
          frequency_component: frequencyPrediction,
          sequence_component: sequencePrediction,
          gap_analysis_component: gapAnalysisPrediction,
          timestamp: new Date().toISOString()
        }
      }, {
        onConflict: "draw_name,prediction_date,model_used"
      });

    if (insertError) {
      console.error("Error inserting prediction:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        drawName,
        predictionDate,
        predictedNumbers: combinedPrediction,
        confidenceScore,
        drawsAnalyzed: historicalData.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Prediction error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// LightGBM-like: Statistical frequency analysis
function predictByFrequency(data: HistoricalDraw[]): number[] {
  const frequency: Map<number, number> = new Map();
  
  // Count frequencies with time decay (recent draws weighted more)
  data.forEach((draw, index) => {
    const weight = Math.exp(-index / 20); // Exponential decay
    draw.winning_numbers.forEach(num => {
      frequency.set(num, (frequency.get(num) || 0) + weight);
    });
  });

  // Sort by frequency and select top numbers
  const sortedNumbers = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => num);

  // Add some randomness to avoid predictability
  const topCandidates = sortedNumbers.slice(0, 12);
  return selectWithRandomization(topCandidates, 5);
}

// CatBoost-like: Analyze number associations and patterns
function predictBySequence(data: HistoricalDraw[]): number[] {
  const associations: Map<string, number> = new Map();
  
  // Analyze which numbers appear together
  data.forEach(draw => {
    for (let i = 0; i < draw.winning_numbers.length; i++) {
      for (let j = i + 1; j < draw.winning_numbers.length; j++) {
        const key = `${draw.winning_numbers[i]}-${draw.winning_numbers[j]}`;
        associations.set(key, (associations.get(key) || 0) + 1);
      }
    }
  });

  // Find numbers with strong associations
  const numberScores: Map<number, number> = new Map();
  associations.forEach((count, key) => {
    const [num1, num2] = key.split("-").map(Number);
    numberScores.set(num1, (numberScores.get(num1) || 0) + count);
    numberScores.set(num2, (numberScores.get(num2) || 0) + count);
  });

  const sortedByAssociation = Array.from(numberScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => num);

  return selectWithRandomization(sortedByAssociation.slice(0, 12), 5);
}

// Transformers-like: Temporal sequence analysis
function predictByGapAnalysis(data: HistoricalDraw[]): number[] {
  const gaps: Map<number, number[]> = new Map();
  const lastSeen: Map<number, number> = new Map();

  // Track gaps between appearances
  data.reverse().forEach((draw, index) => {
    for (let num = 1; num <= 90; num++) {
      if (draw.winning_numbers.includes(num)) {
        if (lastSeen.has(num)) {
          const gap = index - lastSeen.get(num)!;
          const numGaps = gaps.get(num) || [];
          numGaps.push(gap);
          gaps.set(num, numGaps);
        }
        lastSeen.set(num, index);
      }
    }
  });

  // Calculate expected appearance based on average gap
  const currentIndex = data.length;
  const scores: [number, number][] = [];

  for (let num = 1; num <= 90; num++) {
    const numGaps = gaps.get(num) || [];
    if (numGaps.length > 0) {
      const avgGap = numGaps.reduce((a, b) => a + b, 0) / numGaps.length;
      const lastSeenIndex = lastSeen.get(num) || 0;
      const currentGap = currentIndex - lastSeenIndex;
      
      // Numbers "due" based on average gap get higher scores
      const score = currentGap >= avgGap ? currentGap / avgGap : 0.5;
      scores.push([num, score]);
    }
  }

  const sortedByGap = scores
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => num);

  return selectWithRandomization(sortedByGap.slice(0, 12), 5);
}

// Ensemble combination with Bayesian-like weighting
function combineModels(models: { numbers: number[]; weight: number }[]): number[] {
  const scores: Map<number, number> = new Map();

  models.forEach(({ numbers, weight }) => {
    numbers.forEach((num, index) => {
      const positionWeight = (5 - index) / 5; // Higher weight for top positions
      scores.set(num, (scores.get(num) || 0) + weight * positionWeight);
    });
  });

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([num]) => num)
    .sort((a, b) => a - b);
}

// Calculate confidence based on historical pattern consistency
function calculateConfidence(data: HistoricalDraw[], prediction: number[]): number {
  let matchScore = 0;
  const recentDraws = data.slice(0, 20);

  recentDraws.forEach(draw => {
    const matches = prediction.filter(num => draw.winning_numbers.includes(num)).length;
    matchScore += matches / 5;
  });

  // Normalize to 0-100 scale
  const baseConfidence = (matchScore / recentDraws.length) * 100;
  
  // Add variance penalty (more consistent = higher confidence)
  const variance = calculateVariance(data);
  const variancePenalty = Math.min(variance / 10, 20);
  
  return Math.max(Math.min(baseConfidence - variancePenalty, 95), 30);
}

function calculateVariance(data: HistoricalDraw[]): number {
  const frequencies: Map<number, number> = new Map();
  
  data.forEach(draw => {
    draw.winning_numbers.forEach(num => {
      frequencies.set(num, (frequencies.get(num) || 0) + 1);
    });
  });

  const values = Array.from(frequencies.values());
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance);
}

function selectWithRandomization(candidates: number[], count: number): number[] {
  const selected: number[] = [];
  const pool = [...candidates];

  while (selected.length < count && pool.length > 0) {
    // Weighted random selection (favor top candidates)
    const weights = pool.map((_, i) => Math.pow(0.8, i));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    selected.push(pool[selectedIndex]);
    pool.splice(selectedIndex, 1);
  }

  return selected.sort((a, b) => a - b);
}
