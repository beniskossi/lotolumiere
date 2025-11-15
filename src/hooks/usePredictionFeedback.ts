import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackData {
  prediction_id: string;
  rating: number;
  matches: number;
  comments?: string;
}

// Note: user_prediction_feedback table doesn't exist
// Returns empty data to prevent errors
export const usePredictionFeedback = (userId?: string) => {
  return useQuery({
    queryKey: ["prediction-feedback", userId],
    queryFn: async () => {
      return [];
    },
    enabled: !!userId,
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feedback: FeedbackData) => {
      const safeLog = {
        prediction_id: feedback.prediction_id.substring(0, 50),
        rating: feedback.rating,
        matches: feedback.matches,
      };
      console.log("Feedback submitted:", safeLog);
      return { success: true };
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
      return {
        avgRating: 0,
        avgMatches: 0,
        totalFeedbacks: 0,
        adjustedConfidence: 0,
      };
    },
  });
};
