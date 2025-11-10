import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TuningResult {
  algorithm: string;
  displayName: string;
  previousWeight: number;
  newWeight: number;
  improvement: number;
  parametersChanged: number;
  performance: {
    avgAccuracy: number;
    totalPredictions: number;
    bestMatch: number;
  };
}

export interface AutoTuningResponse {
  success: boolean;
  message: string;
  results: TuningResult[];
  timestamp: string;
}

export const useAutoTuning = () => {
  return useMutation({
    mutationFn: async (drawName?: string) => {
      const { data, error } = await supabase.functions.invoke("auto-tune-algorithms", {
        body: { drawName },
      });

      if (error) throw error;
      return data as AutoTuningResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Auto-tuning terminé`, {
          description: `${data.results.length} algorithmes optimisés`,
        });
      } else {
        toast.warning(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de l'auto-tuning", {
        description: error.message,
      });
    },
  });
};

export interface BestAlgorithmRecommendation {
  algorithm: string;
  score: number;
  weight: number;
  metrics: {
    avgAccuracy: number;
    totalPredictions: number;
    bestMatch: number;
    excellentPredictions: number;
  };
  config: {
    parameters: Record<string, any>;
    enabled: boolean;
  } | null;
}

export interface BestAlgorithmResponse {
  success: boolean;
  drawName: string;
  recommendation: {
    primary: BestAlgorithmRecommendation;
    alternatives: BestAlgorithmRecommendation[];
  };
  usingGlobalData: boolean;
  totalAlgorithmsAnalyzed: number;
  timestamp: string;
}

export const useBestAlgorithm = (drawName: string) => {
  return useQuery({
    queryKey: ["best-algorithm", drawName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("select-best-algorithm", {
        body: { drawName },
      });

      if (error) throw error;
      return data as BestAlgorithmResponse;
    },
    enabled: !!drawName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export interface AlgorithmConfig {
  id: string;
  algorithm_name: string;
  description: string | null;
  parameters: Record<string, any>;
  weight: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useAlgorithmConfigs = () => {
  return useQuery({
    queryKey: ["algorithm-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("algorithm_config")
        .select("*")
        .order("weight", { ascending: false });

      if (error) throw error;
      return data as AlgorithmConfig[];
    },
  });
};

export interface TrainingHistory {
  id: string;
  algorithm_name: string;
  training_date: string;
  previous_parameters: Record<string, any>;
  new_parameters: Record<string, any>;
  previous_weight: number;
  new_weight: number;
  performance_improvement: number;
  training_metrics: Record<string, any>;
  created_at: string;
}

export const useTrainingHistory = (algorithmName?: string) => {
  return useQuery({
    queryKey: ["training-history", algorithmName],
    queryFn: async () => {
      let query = supabase
        .from("algorithm_training_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (algorithmName) {
        query = query.eq("algorithm_name", algorithmName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TrainingHistory[];
    },
  });
};
