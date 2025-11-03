import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GeneratePredictionParams {
  drawName: string;
}

export const useGeneratePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ drawName }: GeneratePredictionParams) => {
      const { data, error } = await supabase.functions.invoke("generate-prediction", {
        body: { drawName },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalider le cache des prédictions pour ce tirage
      queryClient.invalidateQueries({ 
        queryKey: ["predictions", variables.drawName] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["latest-prediction", variables.drawName] 
      });
    },
  });
};
