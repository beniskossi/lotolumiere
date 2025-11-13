import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrainingMetrics {
  avg_accuracy: number;
  avg_f1_score: number;
  avg_performance: number;
}

export interface TrainingComparison {
  algorithm_name: string;
  before: {
    weight: number;
    avg_accuracy: number;
    avg_f1_score: number;
    overall_score: number;
  };
  after: {
    weight: number;
    avg_accuracy: number;
    avg_f1_score: number;
    overall_score: number;
  };
  improvement: {
    weight_change_pct: number;
    accuracy_change_pct: number;
    f1_change_pct: number;
    overall_change_pct: number;
  };
}

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const useTrainingComparison = (beforeDate?: string, afterDate?: string) => {
  return useQuery({
    queryKey: ["training-comparison", beforeDate, afterDate],
    queryFn: async (): Promise<TrainingComparison[]> => {
      if (!beforeDate || !afterDate) {
        return [];
      }

      // Récupérer les configurations avant et après
      const { data: beforeConfigs, error: beforeError } = await supabase
        .from("algorithm_training_history")
        .select("*")
        .eq("training_date", beforeDate);

      if (beforeError) throw beforeError;

      const { data: afterConfigs, error: afterError } = await supabase
        .from("algorithm_training_history")
        .select("*")
        .eq("training_date", afterDate);

      if (afterError) throw afterError;

      if (!beforeConfigs || !afterConfigs) return [];

      // Créer un mapping pour comparaison
      const comparisons: TrainingComparison[] = [];

      beforeConfigs.forEach((before) => {
        const after = afterConfigs.find(
          (a) => a.algorithm_name === before.algorithm_name
        );

        if (after) {
          const beforeMetrics = before.training_metrics as unknown as TrainingMetrics;
          const afterMetrics = after.training_metrics as unknown as TrainingMetrics;
          
          comparisons.push({
            algorithm_name: before.algorithm_name,
            before: {
              weight: before.previous_weight,
              avg_accuracy: beforeMetrics.avg_accuracy,
              avg_f1_score: beforeMetrics.avg_f1_score,
              overall_score: beforeMetrics.avg_performance,
            },
            after: {
              weight: after.new_weight,
              avg_accuracy: afterMetrics.avg_accuracy,
              avg_f1_score: afterMetrics.avg_f1_score,
              overall_score: afterMetrics.avg_performance,
            },
            improvement: {
              weight_change_pct:
                ((after.new_weight - before.previous_weight) /
                  before.previous_weight) *
                100,
              accuracy_change_pct:
                ((afterMetrics.avg_accuracy - beforeMetrics.avg_accuracy) /
                  beforeMetrics.avg_accuracy) *
                100,
              f1_change_pct:
                ((afterMetrics.avg_f1_score - beforeMetrics.avg_f1_score) /
                  beforeMetrics.avg_f1_score) *
                100,
              overall_change_pct:
                ((afterMetrics.avg_performance - beforeMetrics.avg_performance) /
                  beforeMetrics.avg_performance) *
                100,
            },
          });
        }
      });

      return comparisons;
    },
    enabled: !!beforeDate && !!afterDate,
    staleTime: STALE_TIME,
  });
};
