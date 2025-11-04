import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AlgorithmConfig {
  id: string;
  algorithm_name: string;
  is_enabled: boolean;
  weight: number;
  description: string | null;
  parameters: Record<string, any>;
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

export const useUpdateAlgorithmConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<AlgorithmConfig, "id" | "created_at" | "updated_at">>
    }) => {
      const { data, error } = await supabase
        .from("algorithm_config")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Configuration mise à jour");
      queryClient.invalidateQueries({ queryKey: ["algorithm-configs"] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
};