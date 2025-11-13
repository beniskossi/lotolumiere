import type { DrawResult, PredictionResult } from "./types.ts";

export interface BacktestResult {
  algorithm: string;
  accuracy: number;
  avgMatches: number;
  bestMatch: number;
  worstMatch: number;
  consistency: number;
  totalTests: number;
}

export async function backtestAlgorithm(
  algorithm: (results: DrawResult[]) => PredictionResult,
  algorithmName: string,
  historicalData: DrawResult[],
  windowSize: number = 50
): Promise<BacktestResult> {
  const scores: number[] = [];
  
  for (let i = windowSize; i < Math.min(historicalData.length, windowSize + 20); i++) {
    const trainingData = historicalData.slice(i - windowSize, i);
    const testData = historicalData[i];
    
    try {
      const prediction = algorithm(trainingData);
      const matches = prediction.numbers.filter(n => 
        testData.winning_numbers.includes(n)
      ).length;
      
      scores.push(matches);
    } catch {
      scores.push(0);
    }
  }

  const avgMatches = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgMatches, 2), 0) / scores.length;

  return {
    algorithm: algorithmName,
    accuracy: (avgMatches / 5) * 100,
    avgMatches,
    bestMatch: Math.max(...scores),
    worstMatch: Math.min(...scores),
    consistency: Math.sqrt(variance),
    totalTests: scores.length,
  };
}
