import type { DrawResult, PredictionResult } from "./types.ts";
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
} from "./algorithms.ts";

export function ensemblePrediction(results: DrawResult[]): PredictionResult {
  if (results.length < 5) {
    return {
      numbers: [1, 2, 3, 4, 5],
      confidence: 0.2,
      algorithm: "Ensemble (Données Insuffisantes)",
      factors: ["Données insuffisantes"],
      score: 0.2,
      category: "ensemble",
    };
  }

  const predictions = [
    weightedFrequencyAlgorithm(results),
    bayesianInferenceAlgorithm(results),
    neuralNetworkAlgorithm(results),
    randomForestAlgorithm(results),
    gradientBoostingAlgorithm(results),
    lstmAlgorithm(results),
    arimaAlgorithm(results),
  ];

  const votes: Record<number, number> = {};
  for (let i = 1; i <= 90; i++) votes[i] = 0;

  predictions.forEach(pred => {
    pred.numbers.forEach(num => {
      votes[num] += pred.confidence;
    });
  });

  const finalNumbers = Object.entries(votes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

  return {
    numbers: finalNumbers,
    confidence: Math.min(0.92, avgConfidence * 1.1),
    algorithm: "Ensemble (7 modèles)",
    factors: ["Voting pondéré", "7 algorithmes", "Consensus"],
    score: 0.92,
    category: "ensemble",
  };
}
