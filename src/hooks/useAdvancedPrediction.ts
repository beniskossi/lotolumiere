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

export const useAdvancedPrediction = (drawName: string) => {
  return useQuery({
    queryKey: ["advanced-prediction", drawName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("advanced-ai-prediction", {
        body: { drawName },
      });

      if (error) throw error;
      return data as AdvancedPredictionResponse;
    },
    enabled: !!drawName,
    retry: 3,
    retryDelay: (attempt) => attempt * 1000,
    staleTime: 5 * 60 * 1000,
  });
};