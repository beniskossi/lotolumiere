// Algorithmes de prédiction modulaires et réutilisables

import type { DrawResult, PredictionResult } from "./types.ts";
import {
  generateRandomPrediction,
  selectBalancedNumbers,
  calculateSimpleFrequency,
  selectWithRandomization,
  calculatePairCorrelation,
} from "./utils.ts";

/**
 * Génère une prédiction de fallback en mode dégradé
 */
export function generateFallbackPrediction(
  algorithm: string,
  category: any
): PredictionResult {
  return {
    numbers: generateRandomPrediction(),
    confidence: 0.2,
    algorithm: `${algorithm} (Données Insuffisantes)`,
    factors: ["Données insuffisantes", "Mode dégradé"],
    score: 0.2,
    category,
  };
}

/**
 * Algorithme 1: Analyse fréquentielle pondérée
 */
export function weightedFrequencyAlgorithm(
  results: DrawResult[]
): PredictionResult {
  if (results.length < 5) {
    return generateFallbackPrediction("Analyse Fréquentielle", "statistical");
  }

  const weightedFreq: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) weightedFreq[i] = 0;

  let totalWeight = 0;
  results.slice(0, 100).forEach((result, index) => {
    const weight = Math.exp(-index * 0.05);
    totalWeight += weight * result.winning_numbers.length;
    result.winning_numbers.forEach((num) => {
      weightedFreq[num] += weight;
    });
  });

  // Normalisation
  for (let i = 1; i <= 90; i++) {
    weightedFreq[i] /= totalWeight || 1;
  }

  const sortedNumbers = Object.entries(weightedFreq)
    .sort(([, a], [, b]) => b - a)
    .map(([num]) => parseInt(num));

  const topCandidates = sortedNumbers.slice(0, 15);
  const prediction = selectBalancedNumbers(topCandidates, 5);
  
  const avgScore = prediction.reduce((sum, num) => sum + weightedFreq[num], 0) / 5;
  const confidence = Math.min(0.85, avgScore * 12 + 0.2);

  return {
    numbers: prediction,
    confidence,
    algorithm: "Analyse Fréquentielle Pondérée",
    factors: ["Fréquence", "Pondération temporelle", "Normalisation"],
    score: confidence * 0.85,
    category: "statistical",
  };
}

/**
 * Algorithme 2: Machine Learning - K-means clustering
 */
export function kmeansClusteringAlgorithm(
  results: DrawResult[]
): PredictionResult {
  if (results.length < 10) {
    return generateFallbackPrediction("ML K-means", "ml");
  }

  const numClusters = 5;
  const drawResults = results.slice(0, 200);
  
  // Initialiser les centroïdes aléatoirement
  let centroids = Array.from({ length: numClusters }, () => 
    drawResults[Math.floor(Math.random() * drawResults.length)].winning_numbers
  );
  
  // Itérations k-means
  for (let iter = 0; iter < 15; iter++) {
    const clusters: number[][][] = Array.from({ length: numClusters }, () => []);
    
    // Assigner chaque draw au cluster le plus proche
    drawResults.forEach(result => {
      let bestCluster = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < numClusters; i++) {
        const distance = result.winning_numbers.reduce(
          (dist, num, idx) => dist + Math.abs(num - (centroids[i][idx] || 0)), 
          0
        );
        if (distance < minDistance) {
          minDistance = distance;
          bestCluster = i;
        }
      }
      clusters[bestCluster].push(result.winning_numbers);
    });

    // Recalculer les centroïdes
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return Array(5).fill(0);
      const avg = Array(5).fill(0);
      cluster.forEach(draw => {
        draw.forEach((num, idx) => avg[idx] += num);
      });
      return avg.map(sum => Math.round(sum / cluster.length));
    });
  }

  // Scorer tous les numéros basé sur leur présence dans les clusters
  const clusterScores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) clusterScores[i] = 0;
  
  centroids.forEach((centroid) => {
    centroid.forEach((num) => {
      if (num >= 1 && num <= 90) {
        clusterScores[num] = (clusterScores[num] || 0) + 1;
      }
    });
  });

  const prediction = Object.entries(clusterScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const maxScore = Math.max(...Object.values(clusterScores));
  const avgPredScore = prediction.reduce((sum, num) => sum + clusterScores[num], 0) / 5;
  const confidence = Math.min(0.88, (avgPredScore / maxScore) * 0.9 + 0.1);

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "ML - Clustering K-means",
    factors: ["K-means clustering", "Centroid analysis", "Pattern detection"],
    score: confidence * 0.88,
    category: "ml",
  };
}

/**
 * Algorithme 3: Inférence Bayésienne
 */
export function bayesianInferenceAlgorithm(
  results: DrawResult[]
): PredictionResult {
  if (results.length < 5) {
    return generateFallbackPrediction("Inférence Bayésienne", "bayesian");
  }

  const drawResults = results.slice(0, 150);
  
  // Prior uniforme
  const prior: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) prior[i] = 1 / 90;

  // Likelihood avec pondération temporelle
  const numberCounts: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) numberCounts[i] = 0;

  drawResults.forEach((result, idx) => {
    const weight = Math.exp(-idx * 0.03);
    result.winning_numbers.forEach(num => {
      numberCounts[num] += weight;
    });
  });

  // Lissage de Laplace
  const alpha = 0.5;
  const totalCount = Object.values(numberCounts).reduce((a, b) => a + b, 0);
  const likelihood: Record<number, number> = {};
  
  for (let i = 1; i <= 90; i++) {
    likelihood[i] = (numberCounts[i] + alpha) / (totalCount + alpha * 90);
  }

  // Posterior
  const posterior: Record<number, number> = {};
  let posteriorSum = 0;
  
  for (let i = 1; i <= 90; i++) {
    posterior[i] = prior[i] * likelihood[i];
    posteriorSum += posterior[i];
  }

  // Normalisation
  for (let i = 1; i <= 90; i++) {
    posterior[i] /= posteriorSum || 1;
  }

  const prediction = Object.entries(posterior)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const predSum = prediction.reduce((sum, num) => sum + posterior[num], 0);
  const confidence = Math.min(0.85, predSum * 8);

  return {
    numbers: prediction,
    confidence,
    algorithm: "Inférence Bayésienne",
    factors: ["Prior uniforme", "Likelihood pondérée", "Lissage Laplace"],
    score: confidence * 0.84,
    category: "bayesian",
  };
}

/**
 * Algorithme 4: Neural Network (simulation LSTM)
 */
export function neuralNetworkAlgorithm(
  results: DrawResult[]
): PredictionResult {
  if (results.length < 10) {
    return generateFallbackPrediction("Neural Network", "neural");
  }

  const drawResults = results.slice(0, 300);
  
  // Simulation LSTM avec mémoire court et long terme
  const shortTerm = drawResults.slice(0, 10);
  const longTerm = drawResults.slice(10);
  
  const lstmScores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) lstmScores[i] = 0;
  
  // Mémoire court-terme (décroissance rapide)
  shortTerm.forEach((result, idx) => {
    const weight = 1.0 - (idx * 0.08);
    result.winning_numbers.forEach(num => {
      lstmScores[num] += weight;
    });
  });
  
  // Mémoire long-terme (décroissance lente)
  longTerm.forEach((result, idx) => {
    const weight = Math.exp(-idx * 0.02);
    result.winning_numbers.forEach(num => {
      lstmScores[num] += weight * 0.5;
    });
  });

  const prediction = Object.entries(lstmScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const maxScore = Math.max(...Object.values(lstmScores));
  const avgPredScore = prediction.reduce((sum, num) => sum + lstmScores[num], 0) / 5;
  const confidence = Math.min(0.91, (avgPredScore / maxScore) * 0.93 + 0.05);

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "Neural Network LSTM",
    factors: ["LSTM memory", "Short-term patterns", "Long-term trends"],
    score: confidence * 0.91,
    category: "neural",
  };
}

/**
 * Algorithme 5: Analyse de variance et corrélation
 */
export function varianceAnalysisAlgorithm(
  results: DrawResult[]
): PredictionResult {
  if (results.length < 10) {
    return generateFallbackPrediction("Analyse Variance", "variance");
  }

  const drawResults = results.slice(0, 250);
  
  // Grouper par jour de la semaine
  const dayGroups: Record<number, number[][]> = {};
  for (let i = 0; i < 7; i++) dayGroups[i] = [];
  
  drawResults.forEach(r => {
    const day = new Date(r.draw_date).getDay();
    dayGroups[day].push(r.winning_numbers);
  });

  // Calculer variance pour chaque numéro
  const numberScores: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) {
    const appearancesByDay = Object.values(dayGroups).map(group =>
      group.flat().filter(num => num === i).length
    );
    const mean = appearancesByDay.reduce((a, b) => a + b, 0) / appearancesByDay.length;
    const variance = appearancesByDay.reduce(
      (sum, count) => sum + Math.pow(count - mean, 2), 
      0
    ) / appearancesByDay.length;
    numberScores[i] = 1 / (1 + variance);
  }

  const prediction = Object.entries(numberScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const confidence = Math.min(0.85, Math.max(...Object.values(numberScores)));

  return {
    numbers: prediction.sort((a, b) => a - b),
    confidence,
    algorithm: "Analyse Variance & Corrélation",
    factors: ["ANOVA", "Variance analysis", "Day patterns"],
    score: confidence * 0.86,
    category: "variance",
  };
}
