import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackData {
  prediction_id: string;
  rating: number;
  matches: number;
  comments?: string;
}

export const usePredictionFeedback = (userId?: string) => {
  return useQuery({
    queryKey: ["prediction-feedback", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_prediction_feedback")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feedback: FeedbackData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("user_prediction_feedback")
        .insert({ ...feedback, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prediction-feedback"] });
      toast({
        title: "✓ Feedback enregistré",
        description: "Merci pour votre retour !",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le feedback",
        variant: "destructive",
      });
    },
  });
};

export const useAlgorithmFeedbackStats = (algorithm: string) => {
  return useQuery({
    queryKey: ["algorithm-feedback-stats", algorithm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_prediction_feedback")
        .select("rating, matches")
        .limit(100);

      if (error) throw error;

      const avgRating = data.reduce((sum, f) => sum + f.rating, 0) / data.length;
      const avgMatches = data.reduce((sum, f) => sum + f.matches, 0) / data.length;

      return {
        avgRating: avgRating || 0,
        avgMatches: avgMatches || 0,
        totalFeedbacks: data.length,
        adjustedConfidence: (avgRating / 5) * 0.9,
      };
    },
  });
};
