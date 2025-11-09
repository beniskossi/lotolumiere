// types/performance.ts

export interface PerformanceRecord {
  id: string;
  model_used: string;
  draw_name: string;
  draw_date: string;
  predicted_numbers: number[];
  winning_numbers: number[];
  matches_count: number;
  accuracy_score: number;
  confidence: number;
  execution_time?: number;
  data_points_used?: number;
  prediction_score?: number;
  factors?: string[];
  meta?: Record<string, any>;
}

export interface PerformanceMetrics {
  totalPredictions: number;
  avgAccuracy: number;
  avgConfidence: number;
  avgExecutionTime: number;
  bestMatch: number;
  excellentPredictions: number; // matches_count >= 3
  hitRate: number; // % de prédictions avec au moins 1 match
  accuracyTrend: 'up' | 'down' | 'stable';
  confidenceTrend: 'up' | 'down' | 'stable';
  executionTimeTrend: 'up' | 'down' | 'stable';
}

export interface AlgorithmPerformanceSummary {
  algorithm: string;
  metrics: PerformanceMetrics;
  ranking: number;
  isTopPerformer: boolean;
  improvementOpportunities: string[];
}