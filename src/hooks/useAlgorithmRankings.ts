import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Schémas Zod pour la validation
const AlgorithmRankingSchema = z.object({
  model_used: z.string(),
  draw_name: z.string(),
  total_predictions: z.number(),
  avg_accuracy: z.number(),
  total_matches: z.number(),
  good_predictions: z.number(),
  excellent_predictions: z.number(),
  perfect_predictions: z.number(),
  best_match: z.number(),
  first_prediction: z.string().datetime(),
  last_prediction: z.string().datetime(),
});

const AlgorithmPerformanceSchema = z.object({
  id: z.string().uuid(),
  draw_name: z.string(),
  model_used: z.string(),
  prediction_date: z.string().datetime(),
  draw_date: z.string().datetime(),
  predicted_numbers: z.array(z.number()),
  winning_numbers: z.array(z.number()),
  matches_count: z.number(),
  accuracy_score: z.number(),
  confidence: z.number().optional(),
  execution_time: z.number().optional(),
  data_points_used: z.number().optional(),
  prediction_score: z.number().optional(),
  factors: z.array(z.string()).optional(),
  meta: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
});

// Types TypeScript dérivés
export type AlgorithmRanking = z.infer<typeof AlgorithmRankingSchema>;
export type AlgorithmPerformance = z.infer<typeof AlgorithmPerformanceSchema>;

// Types pour les mutations
interface EvaluatePredictionsResponse {
  newEvaluations: number;
  evaluatedCount: number;
  totalPredictions: number;
  success: boolean;
  message?: string;
}

interface EvaluatePredictionsInput {
  drawName?: string;
  force?: boolean;
  validateOnly?: boolean;
}

export const useAlgorithmRankings = (drawName?: string) => {
  return useQuery({
    queryKey: ["algorithm-rankings", drawName],
    queryFn: async (): Promise<AlgorithmRanking[]> => {
      let query = supabase
        .from("algorithm_rankings")
        .select("*");

      if (drawName) {
        query = query.eq("draw_name", drawName);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erreur de chargement des classements: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Validation des données avec Zod
      const validatedData = z.array(AlgorithmRankingSchema).parse(data);
      return validatedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useAlgorithmPerformanceHistory = (
  modelName?: string, 
  drawName?: string,
  options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: 'draw_date' | 'accuracy_score' | 'matches_count';
    sortOrder?: 'asc' | 'desc';
  }
) => {
  const { limit = 50, startDate, endDate, sortBy = 'draw_date', sortOrder = 'desc' } = options || {};

  return useQuery({
    queryKey: ["algorithm-performance-history", modelName, drawName, limit, startDate, endDate],
    queryFn: async (): Promise<AlgorithmPerformance[]> => {
      let query = supabase
        .from("algorithm_performance")
        .select("*")
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(limit);

      if (modelName) {
        query = query.eq("model_used", modelName);
      }
      if (drawName) {
        query = query.eq("draw_name", drawName);
      }
      if (startDate) {
        query = query.gte("draw_date", startDate);
      }
      if (endDate) {
        query = query.lte("draw_date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erreur de chargement de l'historique: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Validation des données avec Zod
      const validatedData = z.array(AlgorithmPerformanceSchema).parse(data);
      return validatedData;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 8 * 60 * 1000, // 8 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useEvaluatePredictions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EvaluatePredictionsInput): Promise<EvaluatePredictionsResponse> => {
      const { data, error } = await supabase.functions.invoke("evaluate-predictions", {
        body: {
          drawName: input.drawName,
          force: input.force || false,
          validateOnly: input.validateOnly || false,
        },
      });

      if (error) {
        throw new Error(`Erreur d'évaluation: ${error.message}`);
      }

      // Validation de la réponse
      const responseSchema = z.object({
        newEvaluations: z.number(),
        evaluatedCount: z.number(),
        totalPredictions: z.number(),
        success: z.boolean(),
        message: z.string().optional(),
      });

      return responseSchema.parse(data);
    },
    onSuccess: (data) => {
      const { newEvaluations, evaluatedCount, totalPredictions, message } = data;
      
      if (newEvaluations > 0) {
        toast.success(
          `${newEvaluations} nouvelles évaluations sur ${evaluatedCount} prédictions`,
          { description: message }
        );
      } else if (evaluatedCount > 0) {
        toast.info(
          `${evaluatedCount} prédictions déjà évaluées sur ${totalPredictions} totales`,
          { description: message }
        );
      } else {
        toast.info("Aucune prédiction à évaluer", { description: message });
      }
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["algorithm-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["algorithm-performance-history"] });
      queryClient.invalidateQueries({ queryKey: ["detailed-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de l'évaluation", {
        description: error.message,
      });
    },
  });
};

// Nouveau hook pour les statistiques détaillées
export const useAlgorithmStatistics = (drawName?: string) => {
  return useQuery({
    queryKey: ["algorithm-statistics", drawName],
    queryFn: async () => {
      const rankingQuery = supabase
        .from("algorithm_rankings")
        .select("*")
        .eq("draw_name", drawName || "")
        .order("avg_accuracy", { ascending: false });

      const performanceQuery = supabase
        .from("algorithm_performance")
        .select("*")
        .eq("draw_name", drawName || "")
        .order("created_at", { ascending: false })
        .limit(10);

      const [rankingResult, performanceResult] = await Promise.all([
        rankingQuery,
        performanceQuery
      ]);

      if (rankingResult.error) throw rankingResult.error;
      if (performanceResult.error) throw performanceResult.error;

      const rankings = z.array(AlgorithmRankingSchema).parse(rankingResult.data || []);
      const recentPerformance = z.array(AlgorithmPerformanceSchema).parse(performanceResult.data || []);

      return {
        rankings,
        recentPerformance,
        summary: {
          totalAlgorithms: rankings.length,
          avgAccuracy: rankings.length > 0 
            ? rankings.reduce((sum, r) => sum + r.avg_accuracy, 0) / rankings.length 
            : 0,
          totalPredictions: rankings.reduce((sum, r) => sum + r.total_predictions, 0),
          bestAlgorithm: rankings[0]?.model_used || "Aucun",
        }
      };
    },
    enabled: !!drawName,
    staleTime: 5 * 60 * 1000,
  });
};

// Nouveau hook pour les tendances
export const useAlgorithmTrends = (drawName?: string) => {
  return useQuery({
    queryKey: ["algorithm-trends", drawName],
    queryFn: async () => {
      // Requête pour obtenir les tendances (évolution des scores)
      const { data, error } = await supabase
        .rpc('get_algorithm_trends', { 
          p_draw_name: drawName || null 
        });

      if (error) throw error;

      // Validation des tendances
      const trendSchema = z.object({
        model_used: z.string(),
        date: z.string().datetime(),
        accuracy_score: z.number(),
        matches_count: z.number(),
      });

      return z.array(trendSchema).parse(data || []);
    },
    enabled: !!drawName,
    staleTime: 10 * 60 * 1000,
  });
};