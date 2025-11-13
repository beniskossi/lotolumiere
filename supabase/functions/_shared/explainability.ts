import type { DrawResult, PredictionResult } from "./types.ts";

export interface PredictionExplanation {
  number: number;
  reasons: string[];
  weight: number;
  frequency: number;
  lastSeen: number;
  trend: "rising" | "stable" | "falling";
}

export function explainPrediction(
  prediction: PredictionResult,
  results: DrawResult[]
): PredictionExplanation[] {
  return prediction.numbers.map(num => {
    const appearances = results.filter(r => r.winning_numbers.includes(num));
    const freq = appearances.length / results.length;
    const lastSeenIdx = results.findIndex(r => r.winning_numbers.includes(num));
    
    const recent = results.slice(0, 10).filter(r => r.winning_numbers.includes(num)).length;
    const previous = results.slice(10, 20).filter(r => r.winning_numbers.includes(num)).length;
    const trend = recent > previous ? "rising" : recent < previous ? "falling" : "stable";
    
    const reasons: string[] = [];
    if (freq > 0.15) reasons.push(`Fréquence élevée (${(freq * 100).toFixed(1)}%)`);
    if (lastSeenIdx <= 5) reasons.push(`Vu récemment (${lastSeenIdx} tirages)`);
    if (trend === "rising") reasons.push("Tendance à la hausse");
    if (freq > 0.1 && lastSeenIdx <= 10) reasons.push("Chaud");
    
    return {
      number: num,
      reasons,
      weight: freq * (1 / (lastSeenIdx + 1)),
      frequency: freq,
      lastSeen: lastSeenIdx,
      trend,
    };
  });
}
