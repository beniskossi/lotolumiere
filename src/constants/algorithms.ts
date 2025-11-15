// Noms unifiés des algorithmes dans toute l'application
export const ALGORITHM_NAMES = {
  FREQUENCY: "Analyse Fréquentielle",
  KMEANS: "ML K-means",
  BAYESIAN: "Inférence Bayésienne",
  NEURAL: "Neural Network",
  VARIANCE: "Analyse Variance",
  RANDOM_FOREST: "Random Forest",
  GRADIENT_BOOSTING: "Gradient Boosting",
  LSTM: "LSTM Network",
  ARIMA: "ARIMA",
  MARKOV: "Markov Chain",
} as const;

export const ALGORITHM_CATEGORIES = {
  [ALGORITHM_NAMES.FREQUENCY]: "statistical",
  [ALGORITHM_NAMES.KMEANS]: "ml",
  [ALGORITHM_NAMES.BAYESIAN]: "bayesian",
  [ALGORITHM_NAMES.NEURAL]: "neural",
  [ALGORITHM_NAMES.VARIANCE]: "variance",
  [ALGORITHM_NAMES.RANDOM_FOREST]: "lightgbm",
  [ALGORITHM_NAMES.GRADIENT_BOOSTING]: "catboost",
  [ALGORITHM_NAMES.LSTM]: "transformer",
  [ALGORITHM_NAMES.ARIMA]: "arima",
  [ALGORITHM_NAMES.MARKOV]: "markov",
} as const;

export const ALL_ALGORITHMS = Object.values(ALGORITHM_NAMES);
