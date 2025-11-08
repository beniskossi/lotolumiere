// Types partagés entre toutes les edge functions

export interface DrawResult {
  draw_name: string;
  draw_date: string;
  winning_numbers: number[];
  machine_numbers?: number[];
}

export interface PredictionResult {
  numbers: number[];
  confidence: number;
  algorithm: string;
  factors: string[];
  score: number;
  category: AlgorithmCategory;
}

export type AlgorithmCategory = 
  | "statistical" 
  | "ml" 
  | "bayesian" 
  | "neural" 
  | "variance" 
  | "lightgbm" 
  | "catboost" 
  | "transformer" 
  | "arima";

export interface AlgorithmMetrics {
  totalRecords: number;
  dateRange: { start: string; end: string };
  avgConfidence: number;
  dataQuality: number;
  freshness: number;
  completeness: number;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  quality: number;
}
