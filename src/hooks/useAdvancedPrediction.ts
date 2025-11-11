// useAdvancedPrediction.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdvancedPrediction {
  numbers: number[];
  confidence: number;
  algorithm: string;
  factors: string[];
  score: number;
  category: "statistical" | "ml" | "bayesian" | "neural" | "variance" | "lightgbm" | "catboost" | "transformer" | "arima";
}

interface AdvancedPredictionResponse {
  predictions: AdvancedPrediction[];
  warning?: string;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useAdvancedPrediction = (drawName: string) => {
  return useQuery({
    queryKey: ["advanced-prediction", drawName],
    queryFn: async (): Promise<AdvancedPredictionResponse> => {
      const { data, error } = await supabase.functions.invoke("advanced-ai-prediction", {
        body: { drawName },
      });

      if (error) throw error;
      
      // Post-process: Sort numbers in each prediction
      return {
        ...data,
        predictions: data.predictions.map(pred => ({
          ...pred,
          numbers: pred.numbers.sort((a, b) => a - b)
        }))
      } as AdvancedPredictionResponse;
    },
    enabled: !!drawName && drawName.length > 0,
    retry: 3,
    retryDelay: (attempt) => attempt * 1000,
    staleTime: STALE_TIME,
    onError: (error: Error) => {
      toast.error(`Erreur de prédiction: ${error.message}`);
    },
  });
};