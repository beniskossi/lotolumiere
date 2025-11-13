import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserPreference {
  number: number;
  weight: number;
  successRate: number;
}

interface PersonalModel {
  userId: string;
  preferences: UserPreference[];
  adaptedNumbers: number[];
  confidence: number;
  learningScore: number;
}

export const usePersonalLearning = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: model } = useQuery({
    queryKey: ["personal-learning", userId],
    queryFn: async (): Promise<PersonalModel | null> => {
      if (!userId) return null;

      const [favorites, tracking] = await Promise.all([
        supabase.from("user_favorite_numbers").select("*").eq("user_id", userId),
        supabase.from("prediction_tracking").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20)
      ]);

      if (!favorites.data || !tracking.data) return null;

      const numberStats: Record<number, { used: number; hits: number }> = {};

      favorites.data.forEach(fav => {
        fav.favorite_numbers.forEach((num: number) => {
          if (!numberStats[num]) numberStats[num] = { used: 0, hits: 0 };
          numberStats[num].used++;
        });
      });

      tracking.data.forEach(track => {
        track.predicted_numbers.forEach((num: number) => {
          if (numberStats[num]) {
            const isHit = track.actual_numbers?.includes(num);
            if (isHit) numberStats[num].hits++;
          }
        });
      });

      const preferences: UserPreference[] = Object.entries(numberStats)
        .map(([num, stats]) => ({
          number: parseInt(num),
          weight: stats.used,
          successRate: stats.used > 0 ? (stats.hits / stats.used) * 100 : 0
        }))
        .sort((a, b) => b.successRate - a.successRate);

      const topNumbers = preferences
        .filter(p => p.successRate > 20)
        .slice(0, 10)
        .map(p => p.number);

      const learningScore = preferences.length > 0
        ? preferences.reduce((sum, p) => sum + p.successRate, 0) / preferences.length
        : 0;

      return {
        userId,
        preferences,
        adaptedNumbers: topNumbers,
        confidence: Math.min(90, 50 + learningScore * 0.5),
        learningScore
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const updateLearning = useMutation({
    mutationFn: async ({ numbers, result }: { numbers: number[]; result: number[] }) => {
      if (!userId) throw new Error("User not authenticated");

      await supabase.from("prediction_tracking").insert({
        user_id: userId,
        predicted_numbers: numbers,
        actual_numbers: result,
        matches: numbers.filter(n => result.includes(n)).length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-learning", userId] });
    }
  });

  return { model, updateLearning };
};
