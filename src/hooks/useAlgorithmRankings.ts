import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AlgorithmRanking {
  model_used: string;
  draw_name: string;
  total_predictions: number;
  avg_accuracy: number;
  total_matches: number;
  good_predictions: number;
  excellent_predictions: number;
  perfect_predictions: number;
  best_match: number;
  first_prediction: string;
  last_prediction: string;
}

export interface AlgorithmPerformance {
  id: string;
  draw_name: string;
  model_used: string;
  prediction_date: string;
  draw_date: string;
  predicted_numbers: number[];
  winning_numbers: number[];
  matches_count: number;
  accuracy_score: number;
  created_at: string;
}

export const useAlgorithmRankings = (drawName?: string) => {
  return useQuery({
    queryKey: ["algorithm-rankings", drawName],
    queryFn: async () => {
      let query = supabase
        .from("algorithm_rankings")
        .select("*");

      if (drawName) {
        query = query.eq("draw_name", drawName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AlgorithmRanking[];
    },
  });
};

export const useAlgorithmPerformanceHistory = (modelName?: string, drawName?: string) => {
  return useQuery({
    queryKey: ["algorithm-performance-history", modelName, drawName],
    queryFn: async () => {
      let query = supabase
        .from("algorithm_performance")
        .select("*")
        .order("draw_date", { ascending: false })
        .limit(50);

      if (modelName) {
        query = query.eq("model_used", modelName);
      }
      if (drawName) {
        query = query.eq("draw_name", drawName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AlgorithmPerformance[];
    },
  });
};

export const useEvaluatePredictions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (drawName?: string) => {
      const { data, error } = await supabase.functions.invoke("evaluate-predictions", {
        body: { drawName },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const newCount = data.newEvaluations || 0;
      const totalCount = data.evaluatedCount || 0;
      
      if (newCount > 0) {
        toast.success(`${newCount} nouvelles évaluations sur ${totalCount} prédictions`);
      } else {
        toast.info(`${totalCount} prédictions déjà évaluées`);
      }
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["algorithm-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["detailed-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["algorithm-performance-history"] });
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'évaluation: ${error.message}`);
    },
  });
};
