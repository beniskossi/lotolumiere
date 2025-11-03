import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GlobalStatistics {
  totalDraws: number;
  totalNumbers: number;
  lastUpdate: string | null;
  mostFrequentGlobal: Array<{ number: number; frequency: number }>;
  recentDraws: number;
}

export const useGlobalStatistics = () => {
  return useQuery({
    queryKey: ["global-statistics"],
    queryFn: async (): Promise<GlobalStatistics> => {
      // Récupérer le nombre total de tirages
      const { count: totalDraws } = await supabase
        .from("draw_results")
        .select("*", { count: "exact", head: true });

      // Récupérer la dernière date de mise à jour
      const { data: latestDraw } = await supabase
        .from("draw_results")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Récupérer les numéros les plus fréquents globalement
      const { data: frequentNumbers } = await supabase
        .from("number_statistics")
        .select("number, frequency")
        .order("frequency", { ascending: false })
        .limit(5);

      // Grouper par numéro et sommer les fréquences
      const numberMap = new Map<number, number>();
      frequentNumbers?.forEach((stat) => {
        const current = numberMap.get(stat.number) || 0;
        numberMap.set(stat.number, current + stat.frequency);
      });

      const mostFrequentGlobal = Array.from(numberMap.entries())
        .map(([number, frequency]) => ({ number, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

      // Compter le nombre de numéros uniques dans les statistiques
      const { count: totalNumbers } = await supabase
        .from("number_statistics")
        .select("number", { count: "exact", head: true });

      // Tirages des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentDraws } = await supabase
        .from("draw_results")
        .select("*", { count: "exact", head: true })
        .gte("draw_date", sevenDaysAgo.toISOString().split('T')[0]);

      return {
        totalDraws: totalDraws || 0,
        totalNumbers: totalNumbers || 0,
        lastUpdate: latestDraw?.created_at || null,
        mostFrequentGlobal,
        recentDraws: recentDraws || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
