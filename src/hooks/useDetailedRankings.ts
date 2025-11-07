import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DetailedRanking {
  model_used: string;
  draw_name: string;
  total_predictions: number;
  avg_accuracy: number;
  accuracy_stddev: number;
  total_matches: number;
  good_predictions: number;
  excellent_predictions: number;
  outstanding_predictions: number;
  perfect_predictions: number;
  best_match: number;
  worst_match: number;
  first_prediction: string;
  last_prediction: string;
  consistency_score: number;
  precision_rate: number;
  recall_rate: number;
  f1_score: number;
  overall_score: number;
}

export const useDetailedRankings = (drawName?: string) => {
  return useQuery({
    queryKey: ["detailed-rankings", drawName],
    queryFn: async () => {
      let query = supabase
        .from("algorithm_rankings_detailed")
        .select("*")
        .order("overall_score", { ascending: false });

      if (drawName) {
        query = query.eq("draw_name", drawName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DetailedRanking[];
    },
  });
};

export const useRefreshRankings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("refresh_algorithm_rankings");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detailed-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["algorithm-rankings"] });
      toast.success("Classements mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};
