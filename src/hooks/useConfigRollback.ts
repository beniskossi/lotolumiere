import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RollbackData {
  trainingDate: string;
  algorithmName?: string;
}

export const useConfigRollback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trainingDate, algorithmName }: RollbackData) => {
      // Récupérer la configuration historique
      let query = supabase
        .from("algorithm_training_history")
        .select("*")
        .eq("training_date", trainingDate);

      if (algorithmName) {
        query = query.eq("algorithm_name", algorithmName);
      }

      const { data: historyData, error: historyError } = await query;

      if (historyError) throw historyError;
      if (!historyData || historyData.length === 0) {
        throw new Error("Aucune configuration historique trouvée");
      }

      // Restaurer les configurations
      const updates = historyData.map(async (history) => {
        const { data: configData, error: configError } = await supabase
          .from("algorithm_config")
          .select("id")
          .eq("algorithm_name", history.algorithm_name)
          .single();

        if (configError || !configData) {
          console.error(`Config not found for ${history.algorithm_name}`);
          return null;
        }

        const { error: updateError } = await supabase
          .from("algorithm_config")
          .update({
            weight: history.previous_weight,
            parameters: history.previous_parameters,
          })
          .eq("id", configData.id);

        if (updateError) throw updateError;
        return history.algorithm_name;
      });

      const results = await Promise.all(updates);
      const successfulRollbacks = results.filter((r) => r !== null);

      return {
        success: true,
        count: successfulRollbacks.length,
        algorithms: successfulRollbacks,
      };
    },
    onSuccess: (data) => {
      toast.success(
        `Rollback réussi pour ${data.count} algorithme(s)`,
        {
          description: data.algorithms.join(", "),
        }
      );
      queryClient.invalidateQueries({ queryKey: ["algorithm-configs"] });
      queryClient.invalidateQueries({ queryKey: ["training-history"] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur de rollback: ${error.message}`);
    },
  });
};
