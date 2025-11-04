import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DrawResult {
  draw_name: string;
  draw_date: string;
  winning_numbers: number[];
}

interface AdvancedPredictionResult {
  numbers: number[];
  confidence: number;
  algorithm: string;
  factors: string[];
  score: number;
  category: "statistical" | "ml" | "bayesian" | "neural" | "variance" | "lightgbm" | "catboost" | "transformer";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawName } = await req.json();

    if (!drawName) {
      throw new Error("drawName is required");
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

    if (error) throw error;
    
    // Si pas de résultats du tout, retourner des prédictions en mode dégradé
    if (!results || results.length === 0) {
      console.log(`Aucune donnée pour ${drawName}, génération de prédictions en mode dégradé`);
      const predictions = generateFallbackPredictions(drawName);
      return new Response(JSON.stringify({ 
        predictions,
        warning: "Aucune donnée historique - Prédictions générées en mode dégradé"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Si moins de 5 résultats, utiliser uniquement le mode dégradé
    if (results.length < 5) {
      console.log(`Seulement ${results.length} résultats pour ${drawName}, mode dégradé activé`);
      const predictions = generateFallbackPredictions(drawName);
      return new Response(JSON.stringify({ 
        predictions,
        warning: `Données insuffisantes (${results.length} tirages) - Prédictions en mode dégradé`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Générer les prédictions normalement
    const predictions = generateAdvancedPredictions(results as DrawResult[], drawName);
    
    // Ajouter un avertissement si moins de 20 résultats
    const response: any = { predictions };
    if (results.length < 20) {
      response.warning = `Données limitées (${results.length} tirages) - Prédictions avec confiance réduite`;
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in advanced-ai-prediction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Utility functions
function generateRandomPrediction(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 90) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function generateFallbackPrediction(algorithm: string, category: any): AdvancedPredictionResult {
  return {
    numbers: generateRandomPrediction(),
    confidence: 0.2,
    algorithm: `${algorithm} (Données Insuffisantes)`,
    factors: ["Données insuffisantes", "Mode dégradé"],
    score: 0.2,
    category,
  };
}

function getNumberColorGroup(number: number): string {
  if (number >= 1 && number <= 9) return 'white';
  if (number >= 10 && number <= 19) return 'blue';
  if (number >= 20 && number <= 29) return 'green';
  if (number >= 30 && number <= 39) return 'indigo';
  if (number >= 40 && number <= 49) return 'yellow';
  if (number >= 50 && number <= 59) return 'pink';
  if (number >= 60 && number <= 69) return 'orange';
  if (number >= 70 && number <= 79) return 'gray';
  if (number >= 80 && number <= 90) return 'red';
  return 'unknown';
}

function selectBalancedNumbers(candidates: number[], count: number): number[] {
  if (candidates.length <= count) return candidates;

  const colorGroups: Record<string, number[]> = {};
  candidates.forEach(num => {
    const group = getNumberColorGroup(num);
    if (!colorGroups[group]) {
      colorGroups[group] = [];
    }
    colorGroups[group].push(num);
  });

  const selected: number[] = [];
  const groupKeys = Object.keys(colorGroups);
  
  for (let i = 0; i < groupKeys.length && selected.length < count; i++) {
    const group = groupKeys[i];
    if (colorGroups[group].length > 0) {
      const numberToAdd = colorGroups[group].shift();
      if (numberToAdd) {
        selected.push(numberToAdd);
      }
    }
  }

  let remainingCandidates = candidates.filter(num => !selected.includes(num));
  while (selected.length < count && remainingCandidates.length > 0) {
    selected.push(remainingCandidates.shift()!);
  }

  return selected.slice(0, count).sort((a, b) => a - b);
}

// Fonction pour générer toutes les prédictions en mode dégradé
function generateFallbackPredictions(drawName: string): AdvancedPredictionResult[] {
  return [
    generateFallbackPrediction("Analyse Fréquentielle Pondérée", "statistical"),
    generateFallbackPrediction("ML - Clustering k-means", "ml"),
    generateFallbackPrediction("Inférence Bayésienne (Naive)", "bayesian"),
    generateFallbackPrediction("Séries Temporelles (Régression)", "neural"),
    generateFallbackPrediction("Analyse Variance & Corrélation", "variance"),
    generateFallbackPrediction("LightGBM-like (Gradient Boosting)", "lightgbm"),
    generateFallbackPrediction("CatBoost-like (Categorical Boost)", "catboost"),
    generateFallbackPrediction("Transformers-like (Attention)", "transformer"),
  ];
}

// Algorithm 1: Weighted Frequency
function weightedFrequencyPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 100);
  if (drawResults.length < 5) {
    return generateFallbackPrediction("Analyse Fréquentielle Pondérée", "statistical");
  }

  const weightedFreq: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) weightedFreq[i] = 0;

  let totalWeight = 0;
  drawResults.forEach((result, index) => {
    const weight = Math.exp(-index * 0.05);
    totalWeight += weight * result.winning_numbers.length;
    result.winning_numbers.forEach((num) => {
      weightedFreq[num] += weight;
    });
  });

  for (let i = 1; i <= 90; i++) {
    weightedFreq[i] /= totalWeight;
  }

  const sortedNumbers = Object.entries(weightedFreq)
    .sort(([, a], [, b]) => b - a)
    .map(([num]) => parseInt(num));

  const topCandidates = sortedNumbers.slice(0, 20);
  const prediction = selectBalancedNumbers(topCandidates, 5);
  
  const confidence = Math.min(0.8, Math.max(...Object.values(weightedFreq)) * 10);

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "Analyse Fréquentielle Pondérée",
    factors: ["Fréquence", "Pondération temporelle", "Normalisation"],
    score: confidence * 0.8,
    category: "statistical",
  };
}

// Algorithm 2: K-means Clustering
function machineLearningPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 200);
  if (drawResults.length < 10) {
    return generateFallbackPrediction("ML - Clustering k-means", "ml");
  }

  const numClusters = 5;
  let centroids = Array.from({ length: numClusters }, () => 
    drawResults[Math.floor(Math.random() * drawResults.length)].winning_numbers
  );
  let clusters: number[][][] = [];

  for (let iter = 0; iter < 10; iter++) {
    clusters = Array.from({ length: numClusters }, () => []);
    drawResults.forEach(result => {
      let bestCluster = 0;
      let minDistance = Infinity;
      for (let i = 0; i < numClusters; i++) {
        const distance = result.winning_numbers.reduce((dist, num, idx) => 
          dist + Math.abs(num - (centroids[i][idx] || 0)), 0
        );
        if (distance < minDistance) {
          minDistance = distance;
          bestCluster = i;
        }
      }
      clusters[bestCluster].push(result.winning_numbers);
    });

    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return Array(5).fill(0);
      const avg = Array(5).fill(0);
      cluster.forEach(draw => {
        draw.forEach((num, idx) => avg[idx] += num);
      });
      return avg.map(sum => Math.round(sum / cluster.length));
    });
  }

  const largestCluster = clusters.reduce((largest, current) => 
    current.length > largest.length ? current : largest, []
  );
  
  if (largestCluster.length === 0) return generateFallbackPrediction("Pattern ML", "ml");

  const numberScores: Record<number, number> = {};
  largestCluster.flat().forEach(num => {
    numberScores[num] = (numberScores[num] || 0) + 1;
  });

  const prediction = Object.entries(numberScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.85, (largestCluster.length / drawResults.length) * 1.2);

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "ML - Clustering k-means",
    factors: ["Clustering", "Détection de groupes", "Centroïdes"],
    score: confidence * 0.85,
    category: "ml",
  };
}

// Algorithm 3: Naive Bayes
function bayesianPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 150);
  if (drawResults.length < 5) {
    return generateFallbackPrediction("Inférence Bayésienne (Naive)", "bayesian");
  }

  const totalDraws = drawResults.length;
  const numberCounts: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) numberCounts[i] = 0;

  drawResults.forEach(result => {
    result.winning_numbers.forEach(num => {
      numberCounts[num]++;
    });
  });

  const likelihood: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) {
    likelihood[i] = (numberCounts[i] + 1) / (totalDraws + 2);
  }

  const posterior = likelihood;

  const prediction = Object.entries(posterior)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.8, Math.max(...Object.values(posterior)) / (1/90));

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "Inférence Bayésienne (Naive)",
    factors: ["Probabilité à priori", "Vraisemblance", "Lissage de Laplace"],
    score: confidence * 0.82,
    category: "bayesian",
  };
}

// Algorithm 4: Time Series (Linear Regression)
function neuralNetworkPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 300);
  if (drawResults.length < 10) {
    return generateFallbackPrediction("Séries Temporelles (Régression)", "neural");
  }

  const numberPositions: Record<number, number[]> = {};
  for (let i = 1; i <= 90; i++) numberPositions[i] = [];

  drawResults.forEach((result, index) => {
    result.winning_numbers.forEach(num => {
      numberPositions[num].push(index);
    });
  });

  const nextDrawIndex = drawResults.length;
  const predictions: Record<number, number> = {};

  for (let i = 1; i <= 90; i++) {
    const positions = numberPositions[i];
    if (positions.length < 2) {
      predictions[i] = 0;
      continue;
    }

    const n = positions.length;
    const sum_x = positions.reduce((a, b) => a + b, 0);
    const sum_y = Array.from({ length: n }, (_, i) => i).reduce((a, b) => a + b, 0);
    const sum_xy = positions.reduce((sum, pos, idx) => sum + pos * idx, 0);
    const sum_xx = positions.reduce((sum, pos) => sum + pos * pos, 0);

    const m = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    const b = (sum_y - m * sum_x) / n;

    const nextAppearance = (m * nextDrawIndex + b);
    predictions[i] = 1 / (1 + Math.abs(nextAppearance - n));
  }

  const sortedPredictions = Object.entries(predictions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.9, Math.max(...Object.values(predictions)) * 1.5);

  return {
    numbers: sortedPredictions.sort((a, b) => a - b),
    confidence,
    algorithm: "Séries Temporelles (Régression)",
    factors: ["Régression linéaire", "Prédiction de position", "Analyse de tendance"],
    score: confidence * 0.9,
    category: "neural",
  };
}

// Algorithm 5: Variance & Correlation
function varianceAnalysisPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 250);
  if (drawResults.length < 10) {
    return generateFallbackPrediction("Analyse Variance & Corrélation", "variance");
  }

  const dayGroups: Record<number, number[][]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  drawResults.forEach(r => {
    const day = new Date(r.draw_date).getDay();
    dayGroups[day].push(r.winning_numbers);
  });

  const numberScores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) {
    const appearancesByDay = Object.values(dayGroups).map(group =>
      group.flat().filter(num => num === i).length
    );
    const mean = appearancesByDay.reduce((a, b) => a + b, 0) / appearancesByDay.length;
    const variance = appearancesByDay.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / appearancesByDay.length;
    numberScores[i] = 1 / (1 + variance);
  }

  const correlations: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) correlations[i] = 0;

  for (let num1 = 1; num1 <= 90; num1++) {
    for (let num2 = num1 + 1; num2 <= 90; num2++) {
      const correlation = calculatePairCorrelation(drawResults, num1, num2);
      if (!isNaN(correlation)) {
        correlations[num1] += Math.abs(correlation);
        correlations[num2] += Math.abs(correlation);
      }
    }
  }

  const finalScores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) {
    finalScores[i] = (numberScores[i] || 0) * 0.6 + (correlations[i] || 0) * 0.4;
  }

  const prediction = Object.entries(finalScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.85, Math.max(...Object.values(finalScores)));

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "Analyse Variance & Corrélation",
    factors: ["ANOVA (jour)", "Matrice de corrélation", "Analyse de variance"],
    score: confidence * 0.86,
    category: "variance",
  };
}

function calculatePairCorrelation(results: DrawResult[], num1: number, num2: number): number {
  let both = 0, only1 = 0, only2 = 0, none = 0;
  results.forEach(r => {
    const has1 = r.winning_numbers.includes(num1);
    const has2 = r.winning_numbers.includes(num2);
    if (has1 && has2) both++;
    else if (has1) only1++;
    else if (has2) only2++;
    else none++;
  });

  const n = results.length;
  const numerator = (both * none - only1 * only2);
  const denominator = Math.sqrt((both + only1) * (only2 + none) * (both + only2) * (only1 + none));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Algorithm 6: LightGBM-like (Gradient Boosting)
function lightgbmPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 200);
  if (drawResults.length < 10) {
    return generateFallbackPrediction("LightGBM-like (Gradient Boosting)", "lightgbm");
  }

  // Simule un gradient boosting en calculant des résidus
  const numberFeatures: Record<number, { freq: number; avgPosition: number; recentAppearances: number }> = {};
  for (let i = 1; i <= 90; i++) {
    numberFeatures[i] = { freq: 0, avgPosition: 0, recentAppearances: 0 };
  }

  drawResults.forEach((result, idx) => {
    const recency = Math.exp(-idx * 0.03); // Poids décroissant
    result.winning_numbers.forEach((num, pos) => {
      numberFeatures[num].freq += recency;
      numberFeatures[num].avgPosition += pos * recency;
      if (idx < 20) numberFeatures[num].recentAppearances += 1;
    });
  });

  // Score combiné (gradient boosting simulé)
  const scores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) {
    const feat = numberFeatures[i];
    scores[i] = feat.freq * 0.5 + feat.recentAppearances * 0.3 + (5 - feat.avgPosition / Math.max(feat.freq, 1)) * 0.2;
  }

  const prediction = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.88, Math.max(...Object.values(scores)) / 10);

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "LightGBM-like (Gradient Boosting)",
    factors: ["Gradient boosting", "Features engineered", "Récence pondérée"],
    score: confidence * 0.88,
    category: "lightgbm",
  };
}

// Algorithm 7: CatBoost-like (Categorical Boosting)
function catboostPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 250);
  if (drawResults.length < 10) {
    return generateFallbackPrediction("CatBoost-like (Categorical Boost)", "catboost");
  }

  // Simule CatBoost avec des caractéristiques catégorielles (groupes de couleurs)
  const categoryScores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) categoryScores[i] = 0;

  drawResults.forEach((result, idx) => {
    const weight = 1 / (1 + idx * 0.02); // Décroissance douce
    result.winning_numbers.forEach((num) => {
      const colorGroup = getNumberColorGroup(num);
      // Bonus pour la catégorie
      categoryScores[num] += weight * 1.2;
      
      // Propagation aux numéros du même groupe
      for (let j = 1; j <= 90; j++) {
        if (getNumberColorGroup(j) === colorGroup) {
          categoryScores[j] += weight * 0.1;
        }
      }
    });
  });

  const prediction = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.87, Math.max(...Object.values(categoryScores)) / 20);

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "CatBoost-like (Categorical Boost)",
    factors: ["Boosting catégoriel", "Groupes de couleurs", "Propagation"],
    score: confidence * 0.87,
    category: "catboost",
  };
}

// Algorithm 8: Transformers-like (Self-Attention)
function transformerPrediction(results: DrawResult[], drawName: string): AdvancedPredictionResult {
  const drawResults = results.filter((r) => r.draw_name === drawName).slice(0, 100);
  if (drawResults.length < 10) {
    return generateFallbackPrediction("Transformers-like (Attention)", "transformer");
  }

  // Simule un mécanisme d'attention entre les numéros
  const attentionMatrix: Record<number, Record<number, number>> = {};
  for (let i = 1; i <= 90; i++) {
    attentionMatrix[i] = {};
    for (let j = 1; j <= 90; j++) {
      attentionMatrix[i][j] = 0;
    }
  }

  // Calcule les co-occurrences (attention entre paires)
  drawResults.forEach((result) => {
    result.winning_numbers.forEach((num1) => {
      result.winning_numbers.forEach((num2) => {
        if (num1 !== num2) {
          attentionMatrix[num1][num2] += 1;
        }
      });
    });
  });

  // Score d'attention agrégé
  const attentionScores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) {
    attentionScores[i] = Object.values(attentionMatrix[i]).reduce((sum, val) => sum + val, 0);
  }

  // Normalisation softmax-like
  const maxScore = Math.max(...Object.values(attentionScores));
  for (let i = 1; i <= 90; i++) {
    attentionScores[i] = Math.exp(attentionScores[i] / (maxScore + 1));
  }

  const prediction = Object.entries(attentionScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.89, Math.max(...Object.values(attentionScores)) * 0.5);

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "Transformers-like (Attention)",
    factors: ["Self-attention", "Co-occurrence matrix", "Softmax normalization"],
    score: confidence * 0.89,
    category: "transformer",
  };
}

function generateAdvancedPredictions(results: DrawResult[], drawName: string): AdvancedPredictionResult[] {
  return [
    weightedFrequencyPrediction(results, drawName),
    machineLearningPrediction(results, drawName),
    bayesianPrediction(results, drawName),
    neuralNetworkPrediction(results, drawName),
    varianceAnalysisPrediction(results, drawName),
    lightgbmPrediction(results, drawName),
    catboostPrediction(results, drawName),
    transformerPrediction(results, drawName),
  ].sort((a, b) => b.score - a.score);
}
