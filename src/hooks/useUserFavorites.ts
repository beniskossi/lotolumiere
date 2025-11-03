import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserFavorite {
  id: string;
  user_id: string;
  draw_name: string;
  favorite_numbers: number[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserFavorites = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserFavorite[];
    },
    enabled: !!userId,
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (favorite: Omit<UserFavorite, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("user_favorites")
        .insert(favorite)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast({
        title: "Numéros favoris sauvegardés",
        description: "Vos numéros ont été ajoutés à vos favoris",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos favoris",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast({
        title: "Favori supprimé",
        description: "Le favori a été supprimé avec succès",
      });
    },
  });
};