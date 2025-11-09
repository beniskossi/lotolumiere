import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Schéma de validation Zod pour les données de prédiction
const AdvancedPredictionSchema = z.object({
  numbers: z.array(z.number()).min(1),
  confidence: z.number().min(0).max(1),
  algorithm: z.string().min(1),
  factors: z.array(z.string()),
  score: z.number().min(0).max(100),
  category: z.enum([
    "statistical", 
    "ml", 
    "bayesian", 
    "neural", 
    "variance", 
    "lightgbm", 
    "catboost", 
    "transformer", 
    "arima"
  ]),
});

const AdvancedPredictionResponseSchema = z.object({
  predictions: z.array(AdvancedPredictionSchema),
  warning: z.string().optional(),
});

// Types TypeScript dérivés du schéma Zod
export type AdvancedPrediction = z.infer<typeof AdvancedPredictionSchema>;
export type AdvancedPredictionResponse = z.infer<typeof AdvancedPredictionResponseSchema>;

// Constantes pour les clés de requête
const QUERY_KEYS = {
  ADVANCED_PREDICTION: "advanced-prediction" as const,
} as const;

// Constantes pour les catégories d'algorithmes
const ALGORITHM_CATEGORIES = [
  "statistical",
  "ml",
  "bayesian",
  "neural",
  "variance",
  "lightgbm",
  "catboost",
  "transformer",
  "arima",
] as const;

export type AlgorithmCategory = typeof ALGORITHM_CATEGORIES[number];

/**
 * Hook personnalisé pour récupérer les prédictions avancées
 * @param drawName - Nom du tirage pour lequel obtenir les prédictions
 * @param options - Options de configuration pour react-query (optionnel)
 * @returns useQueryResult avec les données de prédiction
 */
export const useAdvancedPrediction = (
  drawName: string,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {}
) => {
  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } = options;

  return useQuery<AdvancedPredictionResponse, Error>({
    queryKey: [QUERY_KEYS.ADVANCED_PREDICTION, drawName],
    queryFn: async (): Promise<AdvancedPredictionResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("advanced-ai-prediction", {
          body: { drawName },
        });

        if (error) {
          throw new Error(`Erreur de l'API de prédiction: ${error.message}`);
        }

        if (!data) {
          throw new Error("Aucune donnée reçue de l'API de prédiction");
        }

        // Validation des données avec Zod
        const validatedData = AdvancedPredictionResponseSchema.parse(data);
        return validatedData;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Erreur inconnue lors de la récupération des prédictions");
      }
    },
    enabled: !!drawName && enabled,
    staleTime,
    cacheTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Fonction utilitaire pour valider un nom de tirage
export const validateDrawName = (drawName: string): boolean => {
  return typeof drawName === 'string' && drawName.trim().length > 0 && drawName.length <= 100;
};

// Fonction utilitaire pour obtenir la catégorie d'algorithme par défaut
export const getDefaultAlgorithmCategory = (): AlgorithmCategory => {
  return "statistical";
};

// Export pour tests unitaires
export const PREDICTION_CONFIG = {
  DEFAULT_STALE_TIME: 5 * 60 * 1000,
  DEFAULT_CACHE_TIME: 10 * 60 * 1000,
  MAX_RETRY_ATTEMPTS: 2,
} as const;