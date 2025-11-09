// types/algorithm.ts

import { z } from "zod";

// Schémas Zod
export const AlgorithmRankingSchema = z.object({
  model_used: z.string(),
  draw_name: z.string(),
  total_predictions: z.number(),
  avg_accuracy: z.number(),
  total_matches: z.number(),
  good_predictions: z.number(),
  excellent_predictions: z.number(),
  perfect_predictions: z.number(),
  best_match: z.number(),
  first_prediction: z.string().datetime(),
  last_prediction: z.string().datetime(),
});

export const AlgorithmPerformanceSchema = z.object({
  id: z.string().uuid(),
  draw_name: z.string(),
  model_used: z.string(),
  prediction_date: z.string().datetime(),
  draw_date: z.string().datetime(),
  predicted_numbers: z.array(z.number()),
  winning_numbers: z.array(z.number()),
  matches_count: z.number(),
  accuracy_score: z.number(),
  confidence: z.number().optional(),
  execution_time: z.number().optional(),
  data_points_used: z.number().optional(),
  prediction_score: z.number().optional(),
  factors: z.array(z.string()).optional(),
  meta: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
});

// Types TypeScript
export type AlgorithmRanking = z.infer<typeof AlgorithmRankingSchema>;
export type AlgorithmPerformance = z.infer<typeof AlgorithmPerformanceSchema>;

// Types pour les mutations
export interface EvaluatePredictionsInput {
  drawName?: string;
  force?: boolean;
  validateOnly?: boolean;
}

export interface EvaluatePredictionsResponse {
  newEvaluations: number;
  evaluatedCount: number;
  totalPredictions: number;
  success: boolean;
  message?: string;
}

// Types pour les tendances
export interface AlgorithmTrend {
  model_used: string;
  date: string;
  accuracy_score: number;
  matches_count: number;
}