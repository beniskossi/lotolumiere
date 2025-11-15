import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { predictionRequestSchema, validateRequest } from "../_shared/validation.ts";

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
    const body = await req.json();
    
    // Validate input
    const validation = validateRequest(predictionRequestSchema, body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { drawName } = validation.data;

    console.log("Generating prediction for draw");

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
      console.error("Error fetching historical data", { error: fetchError.message });
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

    console.log("Analyzing historical draws", { count: historicalData.length });

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

    // Calculate next draw date based on draw schedule
    const nextDrawDate = getNextDrawDate(drawName);
    const predictionDate = nextDrawDate.toISOString().split("T")[0];

    // Calculate confidence scores for each model
    const frequencyConfidence = calculateConfidence(historicalData as HistoricalDraw[], frequencyPrediction);
    const sequenceConfidence = calculateConfidence(historicalData as HistoricalDraw[], sequencePrediction);
    const gapAnalysisConfidence = calculateConfidence(historicalData as HistoricalDraw[], gapAnalysisPrediction);
    const hybridConfidence = calculateConfidence(historicalData as HistoricalDraw[], combinedPrediction);

    // Create predictions for each model
    const predictions = [
      {
        draw_name: drawName,
        prediction_date: predictionDate,
        predicted_numbers: frequencyPrediction,
        confidence_score: frequencyConfidence,
        model_used: "LightGBM-like (Weighted Frequency)",
        model_metadata: {
          historical_draws_analyzed: historicalData.length,
          algorithm: "frequency",
          timestamp: new Date().toISOString()
        }
      },
      {
        draw_name: drawName,
        prediction_date: predictionDate,
        predicted_numbers: sequencePrediction,
        confidence_score: sequenceConfidence,
        model_used: "CatBoost-like (Pattern Sequence)",
        model_metadata: {
          historical_draws_analyzed: historicalData.length,
          algorithm: "sequence",
          timestamp: new Date().toISOString()
        }
      },
      {
        draw_name: drawName,
        prediction_date: predictionDate,
        predicted_numbers: gapAnalysisPrediction,
        confidence_score: gapAnalysisConfidence,
        model_used: "Transformers-like (Gap Analysis)",
        model_metadata: {
          historical_draws_analyzed: historicalData.length,
          algorithm: "gap_analysis",
          timestamp: new Date().toISOString()
        }
      },
      {
        draw_name: drawName,
        prediction_date: predictionDate,
        predicted_numbers: combinedPrediction,
        confidence_score: hybridConfidence,
        model_used: "Hybrid (Ensemble Model)",
        model_metadata: {
          historical_draws_analyzed: historicalData.length,
          frequency_component: frequencyPrediction,
          sequence_component: sequencePrediction,
          gap_analysis_component: gapAnalysisPrediction,
          timestamp: new Date().toISOString()
        }
      }
    ];

    // Insert all predictions
    const { error: insertError } = await supabase
      .from("predictions")
      .upsert(predictions, {
        onConflict: "draw_name,prediction_date,model_used"
      });

    if (insertError) {
      console.error("Error inserting predictions", { error: insertError.message });
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        drawName,
        predictionDate,
        predictions: predictions.map(p => ({
          model: p.model_used,
          numbers: p.predicted_numbers,
          confidence: p.confidence_score
        })),
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

// LightGBM-like: Statistical frequency analysis with hot number detection
function predictByFrequency(data: HistoricalDraw[]): number[] {
  const frequencies = new Map<number, number>();
  const recentWeight = 0.92; // Stronger emphasis on recent draws
  
  // Weight recent draws with exponential decay + recency boost
  data.forEach((draw, index) => {
    const baseWeight = Math.pow(recentWeight, data.length - index - 1);
    // Extra boost for last 10 draws
    const recencyBoost = index >= data.length - 10 ? 1.5 : 1.0;
    const weight = baseWeight * recencyBoost;
    
    draw.winning_numbers.forEach(num => {
      frequencies.set(num, (frequencies.get(num) || 0) + weight);
    });
  });
  
  // Analyze frequency distribution and detect hot numbers
  const avgFreq = Array.from(frequencies.values()).reduce((a, b) => a + b, 0) / frequencies.size;
  const hotThreshold = avgFreq * 1.2;
  
  // Get top numbers with preference for hot numbers
  const sortedNumbers = Array.from(frequencies.entries())
    .sort((a, b) => {
      const aIsHot = a[1] >= hotThreshold ? 1.3 : 1;
      const bIsHot = b[1] >= hotThreshold ? 1.3 : 1;
      return (b[1] * bIsHot) - (a[1] * aIsHot);
    })
    .slice(0, 15)
    .map(([num]) => num);
  
  return selectWithRandomization(sortedNumbers, 5);
}

// CatBoost-like: Analyze number associations - pairs and triples
function predictBySequence(data: HistoricalDraw[]): number[] {
  const pairFrequencies = new Map<string, number>();
  const tripleFrequencies = new Map<string, number>();
  
  // Analyze pairs and triples that appear together
  data.forEach((draw, index) => {
    const weight = Math.pow(0.93, data.length - index - 1);
    const nums = draw.winning_numbers;
    
    // Analyze pairs
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const pair = [nums[i], nums[j]].sort().join('-');
        pairFrequencies.set(pair, (pairFrequencies.get(pair) || 0) + weight);
        
        // Analyze triples
        for (let k = j + 1; k < nums.length; k++) {
          const triple = [nums[i], nums[j], nums[k]].sort().join('-');
          tripleFrequencies.set(triple, (tripleFrequencies.get(triple) || 0) + (weight * 1.5));
        }
      }
    }
  });
  
  // Build prediction prioritizing triples, then pairs
  const usedNumbers = new Set<number>();
  const prediction: number[] = [];
  
  // Try to use strong triples first
  const sortedTriples = Array.from(tripleFrequencies.entries())
    .sort((a, b) => b[1] - a[1]);
  
  for (const [triple] of sortedTriples.slice(0, 2)) {
    const nums = triple.split('-').map(Number);
    nums.forEach(num => {
      if (!usedNumbers.has(num) && prediction.length < 5) {
        prediction.push(num);
        usedNumbers.add(num);
      }
    });
    if (prediction.length >= 5) break;
  }
  
  // Complete with strong pairs
  if (prediction.length < 5) {
    const sortedPairs = Array.from(pairFrequencies.entries())
      .sort((a, b) => b[1] - a[1]);
    
    for (const [pair] of sortedPairs) {
      const [num1, num2] = pair.split('-').map(Number);
      if (!usedNumbers.has(num1) && prediction.length < 5) {
        prediction.push(num1);
        usedNumbers.add(num1);
      }
      if (!usedNumbers.has(num2) && prediction.length < 5) {
        prediction.push(num2);
        usedNumbers.add(num2);
      }
      if (prediction.length >= 5) break;
    }
  }
  
  // Fill remaining with high frequency numbers
  if (prediction.length < 5) {
    const allNums = data.flatMap(d => d.winning_numbers);
    const freq = new Map<number, number>();
    allNums.forEach(n => freq.set(n, (freq.get(n) || 0) + 1));
    const remaining = Array.from(freq.entries())
      .filter(([n]) => !usedNumbers.has(n))
      .sort((a, b) => b[1] - a[1])
      .map(([n]) => n);
    
    prediction.push(...remaining.slice(0, 5 - prediction.length));
  }
  
  return prediction.sort((a, b) => a - b);
}

// Transformers-like: Advanced gap analysis with variance consideration
function predictByGapAnalysis(data: HistoricalDraw[]): number[] {
  const lastAppearance = new Map<number, number>();
  const avgGap = new Map<number, number[]>();
  const gapVariance = new Map<number, number>();
  
  // Track last appearance and gaps for each number
  data.forEach((draw, index) => {
    draw.winning_numbers.forEach(num => {
      if (lastAppearance.has(num)) {
        const gap = index - lastAppearance.get(num)!;
        if (!avgGap.has(num)) avgGap.set(num, []);
        avgGap.get(num)!.push(gap);
      }
      lastAppearance.set(num, index);
    });
  });
  
  // Calculate variance for each number's gap pattern
  avgGap.forEach((gaps, num) => {
    if (gaps.length > 1) {
      const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - mean, 2), 0) / gaps.length;
      gapVariance.set(num, variance);
    }
  });
  
  // Calculate expected next appearance with variance consideration
  const scores = new Map<number, number>();
  for (let num = 1; num <= 90; num++) {
    if (!lastAppearance.has(num)) {
      scores.set(num, 100); // Never appeared, high priority
      continue;
    }
    
    const gaps = avgGap.get(num) || [];
    if (gaps.length === 0) continue;
    
    const avgGapValue = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const currentGap = data.length - 1 - lastAppearance.get(num)!;
    const variance = gapVariance.get(num) || 0;
    
    // Numbers that are "overdue" get higher scores
    // Low variance means more predictable pattern
    const overdueScore = currentGap / Math.max(avgGapValue, 1);
    const consistencyBonus = variance < 5 ? 1.4 : 1.0; // Reward consistent patterns
    
    // Exponential scoring for very overdue numbers
    const finalScore = overdueScore > 1.5 ? 
      Math.pow(overdueScore, 1.3) * consistencyBonus : 
      overdueScore * consistencyBonus;
    
    scores.set(num, finalScore);
  }
  
  // Select numbers with highest scores (most overdue with consistent patterns)
  const sortedNumbers = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([num]) => num);
  
  return selectWithRandomization(sortedNumbers, 5);
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

// Multi-factor confidence calculation with improved accuracy
function calculateConfidence(data: HistoricalDraw[], prediction: number[]): number {
  // Multi-factor confidence calculation
  const recentDraws = data.slice(-15);
  let matchScore = 0;
  
  // Factor 1: Pattern similarity with recent draws
  recentDraws.forEach((draw, index) => {
    const weight = Math.pow((index + 1) / recentDraws.length, 1.2); // More recent = higher weight
    const matches = prediction.filter(num => draw.winning_numbers.includes(num)).length;
    matchScore += matches * weight;
  });
  
  // Factor 2: Frequency of predicted numbers
  const allNumbers = data.flatMap(d => d.winning_numbers);
  const predictionFrequency = prediction.reduce((sum, num) => {
    const freq = allNumbers.filter(n => n === num).length;
    return sum + freq;
  }, 0) / prediction.length;
  const avgFrequency = allNumbers.length / 90;
  const frequencyScore = (predictionFrequency / avgFrequency) * 15;
  
  // Factor 3: Gap analysis consistency
  const lastSeen = new Map<number, number>();
  data.forEach((draw, idx) => {
    draw.winning_numbers.forEach(num => lastSeen.set(num, idx));
  });
  const avgRecency = prediction.reduce((sum, num) => {
    const lastIdx = lastSeen.get(num) ?? -100;
    return sum + (data.length - 1 - lastIdx);
  }, 0) / prediction.length;
  const recencyScore = Math.max(0, 15 - avgRecency / 2);
  
  // Factor 4: Data variance - lower variance means more predictable
  const variance = calculateVariance(data);
  const varianceAdjustment = Math.max(0, 18 - variance);
  
  // Normalize to percentage (35-92)
  const baseConfidence = (matchScore / (recentDraws.length * 5)) * 45;
  const totalConfidence = baseConfidence + frequencyScore + recencyScore + varianceAdjustment;
  
  return Math.min(92, Math.max(35, totalConfidence));
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

function getNextDrawDate(drawName: string): Date {
  // Mapping des tirages aux jours de la semaine (0 = Dimanche, 1 = Lundi, etc.)
  const drawSchedule: Record<string, { day: number; time: string }> = {
    // Lundi (1)
    "Reveil": { day: 1, time: "10:00" },
    "Etoile": { day: 1, time: "13:00" },
    "Akwaba": { day: 1, time: "16:00" },
    "Monday Special": { day: 1, time: "18:15" },
    // Mardi (2)
    "La Matinale": { day: 2, time: "10:00" },
    "Emergence": { day: 2, time: "13:00" },
    "Sika": { day: 2, time: "16:00" },
    "Lucky Tuesday": { day: 2, time: "18:15" },
    // Mercredi (3)
    "Premiere Heure": { day: 3, time: "10:00" },
    "Fortune": { day: 3, time: "13:00" },
    "Baraka": { day: 3, time: "16:00" },
    "Midweek": { day: 3, time: "18:15" },
    // Jeudi (4)
    "Kado": { day: 4, time: "10:00" },
    "Privilege": { day: 4, time: "13:00" },
    "Monni": { day: 4, time: "16:00" },
    "Fortune Thursday": { day: 4, time: "18:15" },
    // Vendredi (5)
    "Cash": { day: 5, time: "10:00" },
    "Solution": { day: 5, time: "13:00" },
    "Wari": { day: 5, time: "16:00" },
    "Friday Bonanza": { day: 5, time: "18:15" },
    // Samedi (6)
    "Soutra": { day: 6, time: "10:00" },
    "Diamant": { day: 6, time: "13:00" },
    "Moaye": { day: 6, time: "16:00" },
    "National": { day: 6, time: "18:15" },
    // Dimanche (0)
    "Benediction": { day: 0, time: "10:00" },
    "Prestige": { day: 0, time: "13:00" },
    "Awale": { day: 0, time: "16:00" },
    "Espoir": { day: 0, time: "18:15" }
  };

  const schedule = drawSchedule[drawName];
  if (!schedule) {
    // Si le tirage n'est pas trouvé, retourner demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const [hours, minutes] = schedule.time.split(":").map(Number);
  
  // Calculer le prochain jour de tirage
  let daysUntilNext = schedule.day - currentDay;
  
  // Si c'est le même jour, vérifier l'heure
  if (daysUntilNext === 0) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Si l'heure du tirage est déjà passée aujourd'hui, passer à la semaine suivante
    if (currentHour > hours || (currentHour === hours && currentMinute >= minutes)) {
      daysUntilNext = 7;
    }
  }
  
  // Si le jour est dans le passé cette semaine, passer à la semaine suivante
  if (daysUntilNext < 0) {
    daysUntilNext += 7;
  }
  
  const nextDrawDate = new Date(now);
  nextDrawDate.setDate(now.getDate() + daysUntilNext);
  nextDrawDate.setHours(hours, minutes, 0, 0);
  
  return nextDrawDate;
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
