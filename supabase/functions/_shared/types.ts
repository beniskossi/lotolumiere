// Types partagés entre toutes les edge functions - VERSION AMÉLIORÉE

export interface DrawResult {
  draw_name: string;
  draw_date: string;
  winning_numbers: number[];
  machine_numbers?: number[];
  draw_time?: string;
  draw_location?: string;
  additional_numbers?: number[];
  bonus_numbers?: number[];
}

export interface PredictionResult {
  numbers: number[];
  confidence: number;
  algorithm: string;
  factors: string[];
  score: number;
  category: AlgorithmCategory;
  metadata?: PredictionMetadata;
}

export interface PredictionMetadata {
  execution_time: number;
  prediction_size: number;
  confidence_factors: string[];
  features_used?: string[];
  model_version?: string;
  data_points_used?: number;
  algorithm_complexity?: 'basic' | 'advanced' | 'expert';
  feature_importance?: Record<string, number>;
  validation_score?: number;
  prediction_stability?: number;
  ensemble_size?: number;
  training_samples?: number;
  feature_dimension?: number;
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
  algorithmPerformance: Record<AlgorithmCategory, AlgorithmPerformance>;
  trendAnalysis: TrendAnalysis;
  seasonalPatterns: SeasonalPatterns;
}

export interface AlgorithmPerformance {
  avgScore: number;
  avgConfidence: number;
  successRate: number;
  executionTime: number;
  stability: number;
}

export interface TrendAnalysis {
  shortTerm: number; // -1 à 1 (tendance récente)
  mediumTerm: number; // -1 à 1 (tendance intermédiaire)
  longTerm: number; // -1 à 1 (tendance long terme)
  volatility: number; // 0-1 (volatilité)
  momentum: number; // -1 à 1 (momentum)
}

export interface SeasonalPatterns {
  weekly: Record<number, number>; // jour 0-6 -> fréquence
  monthly: Record<number, number>; // jour 1-31 -> fréquence
  quarterly: Record<number, number>; // mois 1-12 -> fréquence
  yearly: Record<number, number>; // mois 1-12 -> fréquence
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  quality: number;
  version: string;
  ttl: number;
  metadata: CacheMetadata;
}

export interface CacheMetadata {
  accessCount: number;
  lastAccess: number;
  hitRate: number;
  size: number;
  compression: boolean;
}

export interface AlgorithmContext {
  historicalData: DrawResult[];
  latestDraw?: DrawResult;
  numberFrequency: Map<number, number>;
  numberPositionFrequency: Map<number, number[]>;
  gaps: Map<number, number>;
  trends: Map<number, number>;
  correlations: number[][];
  statisticalMoments: StatisticalMoments;
  seasonalFactors: SeasonalFactors;
  volatility: Record<number, number>;
}

export interface StatisticalMoments {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  entropy: number;
  informationGain: Record<number, number>;
}

export interface SeasonalFactors {
  weekly: Record<number, number>; // 0-6 -> facteur
  monthly: Record<number, number>; // 1-31 -> facteur
  seasonal: Record<number, number>; // 1-12 -> facteur
}

export interface FeatureVector {
  frequency: number;
  gap: number;
  position: number;
  trend: number;
  volatility: number;
  correlation: number;
  seasonal: number;
  entropy: number;
}

export interface EnsemblePrediction {
  predictions: PredictionResult[];
  aggregated: PredictionResult;
  diversity: number;
  confidence: number;
  weights: Record<string, number>;
  meta {
    ensemble_size: number;
    aggregation_method: 'weighted_average' | 'majority_vote' | 'confidence_weighted';
    diversity_score: number;
    stability: number;
  }
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  mae: number;
  rmse: number;
  mape: number;
  stability: number;
  overfitting_risk: number;
}

export interface DataQualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  timeliness: number;
  validity: number;
  reliability: number;
  quality_score: number;
}

export interface PredictionValidation {
  backtest_results: BacktestResult[];
  cross_validation: CrossValidationResult;
  out_of_sample_score: number;
  calibration_score: number;
  sharpness: number;
}

export interface BacktestResult {
  date: string;
  predicted: number[];
  actual: number[];
  hit_rate: number;
  confidence: number;
  score: number;
}

export interface CrossValidationResult {
  folds: number;
  avg_score: number;
  std_dev: number;
  min_score: number;
  max_score: number;
  overfitting_score: number;
}

export interface FeatureImportance {
  feature_name: string;
  importance: number;
  contribution: number;
  correlation_with_target: number;
}

export interface ModelConfig {
  algorithm: AlgorithmCategory;
  hyperparameters: Record<string, any>;
  feature_selection: string[];
  validation_strategy: 'time_series' | 'k_fold' | 'holdout';
  optimization_target: 'accuracy' | 'diversity' | 'stability' | 'confidence';
  ensemble_size?: number;
  max_features?: number;
  min_samples?: number;
}

export interface PredictionAudit {
  timestamp: number;
  algorithm: string;
  input_size: number;
  execution_time: number;
  confidence: number;
  validation_passed: boolean;
  anomaly_detected: boolean;
  drift_detected: boolean;
  metadata: Record<string, any>;
}

export interface TimeSeriesAnalysis {
  trend: number[];
  seasonal: number[];
  residual: number[];
  decomposition_method: string;
  seasonality_strength: number;
  trend_strength: number;
  noise_level: number;
}

export interface CorrelationMatrix {
  matrix: number[][];
  p_values: number[][];
  correlation_type: 'pearson' | 'spearman' | 'kendall';
  significance_level: number;
}

export interface AnomalyDetection {
  anomalies: Anomaly[];
  anomaly_score: number;
  detection_method: string;
  threshold: number;
  confidence: number;
}

export interface Anomaly {
  index: number;
  value: number;
  expected_value: number;
  anomaly_score: number;
  type: 'outlier' | 'trend_change' | 'seasonal_change';
  timestamp: number;
}

export interface DriftDetection {
  drift_detected: boolean;
  drift_magnitude: number;
  drift_direction: number;
  detection_method: string;
  confidence: number;
  timestamp: number;
}