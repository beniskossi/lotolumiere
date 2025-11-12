// useAlgorithmTraining.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TrainingHistory {
  id: string;
  training_date: string;
  algorithm_name: string;
  previous_weight: number;
  new_weight: number;
  previous_parameters: Record<string, any>;
  new_parameters: Record<string, any>;
  performance_improvement: number;
  training_metrics: {
    avg_performance: number;
    avg_accuracy: number;
    avg_f1_score: number;
    total_evaluations: number;
  };
  created_at: string;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useTrainingHistory = (algorithmName?: string, limit = 10) => {
  return useQuery({
    queryKey: ["training-history", algorithmName, limit],
    queryFn: async (): Promise<TrainingHistory[]> => {
      let query = supabase
        .from("algorithm_training_history")
        .select("*")
        .order("training_date", { ascending: false })
        .limit(limit);

      if (algorithmName) {
        query = query.eq("algorithm_name", algorithmName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TrainingHistory[];
    },
    staleTime: STALE_TIME,
  });
};

export const useTrainAlgorithms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session non disponible");

      const { data, error } = await supabase.functions.invoke("train-algorithms", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Entraînement terminé! ${data.updatedCount} algorithmes mis à jour.`,
        {
          description: `${data.trainedCount} algorithmes analysés`,
        }
      );
      queryClient.invalidateQueries({ queryKey: ["algorithm-configs"] });
      queryClient.invalidateQueries({ queryKey: ["training-history"] });
      queryClient.invalidateQueries({ queryKey: ["detailed-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur d'entraînement: ${error.message}`);
    },
  });
};