import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AutoTuningParams {
  drawName: string;
}

interface AutoTuningResult {
  success: boolean;
  message: string;
  results: {
    algorithm: string;
    previousWeight: number;
    newWeight: number;
    improvement: number;
  }[];
}

export const useAutoTuning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ drawName }: AutoTuningParams): Promise<AutoTuningResult> => {
      const { data, error } = await supabase.functions.invoke("auto-tune-algorithms", {
        body: { drawName },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalider les caches liés aux algorithmes
      queryClient.invalidateQueries({ queryKey: ["algorithm-configs"] });
      queryClient.invalidateQueries({ queryKey: ["algorithm-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["training-history"] });
    },
  });
};