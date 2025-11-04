import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PairStatistic {
  pair: [number, number];
  frequency: number;
}

interface TripletStatistic {
  triplet: [number, number, number];
  frequency: number;
}

interface TemporalPattern {
  day: string;
  averageSum: number;
  drawCount: number;
  mostCommon: number[];
}

interface AdvancedStatistics {
  topPairs: PairStatistic[];
  topTriplets: TripletStatistic[];
  evenOddRatio: { even: number; odd: number };
  rangeDistribution: Array<{ range: string; count: number; percentage: number }>;
  sumAnalysis: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  temporalPatterns: TemporalPattern[];
  consecutiveNumbers: { hasConsecutive: number; noConsecutive: number };
}

export const useAdvancedStatistics = (drawName: string) => {
  return useQuery({
    queryKey: ["advanced-statistics", drawName],
    queryFn: async (): Promise<AdvancedStatistics> => {
      // Récupérer les résultats historiques
      const { data: results, error } = await supabase
        .from("draw_results")
        .select("winning_numbers, draw_date, draw_day")
        .eq("draw_name", drawName)
        .order("draw_date", { ascending: false })
        .limit(200);

      if (error) throw error;
      if (!results || results.length === 0) {
        return getEmptyStatistics();
      }

      // Analyse des paires
      const pairMap = new Map<string, number>();
      results.forEach(result => {
        const nums = result.winning_numbers.sort((a: number, b: number) => a - b);
        for (let i = 0; i < nums.length - 1; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            const key = `${nums[i]}-${nums[j]}`;
            pairMap.set(key, (pairMap.get(key) || 0) + 1);
          }
        }
      });

      const topPairs = Array.from(pairMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, frequency]) => {
          const [a, b] = key.split('-').map(Number);
          return { pair: [a, b] as [number, number], frequency };
        });

      // Analyse des triplets
      const tripletMap = new Map<string, number>();
      results.forEach(result => {
        const nums = result.winning_numbers.sort((a: number, b: number) => a - b);
        for (let i = 0; i < nums.length - 2; i++) {
          for (let j = i + 1; j < nums.length - 1; j++) {
            for (let k = j + 1; k < nums.length; k++) {
              const key = `${nums[i]}-${nums[j]}-${nums[k]}`;
              tripletMap.set(key, (tripletMap.get(key) || 0) + 1);
            }
          }
        }
      });

      const topTriplets = Array.from(tripletMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, frequency]) => {
          const [a, b, c] = key.split('-').map(Number);
          return { triplet: [a, b, c] as [number, number, number], frequency };
        });

      // Analyse pair/impair
      let evenCount = 0, oddCount = 0;
      results.forEach(result => {
        result.winning_numbers.forEach((num: number) => {
          if (num % 2 === 0) evenCount++;
          else oddCount++;
        });
      });

      // Distribution par tranches
      const ranges = [
        { start: 1, end: 10, label: "1-10" },
        { start: 11, end: 20, label: "11-20" },
        { start: 21, end: 30, label: "21-30" },
        { start: 31, end: 40, label: "31-40" },
        { start: 41, end: 50, label: "41-50" },
        { start: 51, end: 60, label: "51-60" },
        { start: 61, end: 70, label: "61-70" },
        { start: 71, end: 80, label: "71-80" },
        { start: 81, end: 90, label: "81-90" },
      ];

      const totalNumbers = results.length * 5;
      const rangeDistribution = ranges.map(range => {
        const count = results.reduce((sum, result) => {
          return sum + result.winning_numbers.filter(
            (num: number) => num >= range.start && num <= range.end
          ).length;
        }, 0);
        return {
          range: range.label,
          count,
          percentage: (count / totalNumbers) * 100,
        };
      });

      // Analyse de somme
      const sums = results.map(result => 
        result.winning_numbers.reduce((a: number, b: number) => a + b, 0)
      );
      sums.sort((a, b) => a - b);

      const sumAnalysis = {
        min: Math.min(...sums),
        max: Math.max(...sums),
        average: sums.reduce((a, b) => a + b, 0) / sums.length,
        median: sums[Math.floor(sums.length / 2)],
      };

      // Patterns temporels par jour
      const dayGroups: Record<string, { sums: number[]; draws: number[][]; }> = {};
      results.forEach(result => {
        const day = result.draw_day || "Inconnu";
        if (!dayGroups[day]) {
          dayGroups[day] = { sums: [], draws: [] };
        }
        dayGroups[day].sums.push(
          result.winning_numbers.reduce((a: number, b: number) => a + b, 0)
        );
        dayGroups[day].draws.push(result.winning_numbers);
      });

      const temporalPatterns = Object.entries(dayGroups).map(([day, data]) => {
        const averageSum = data.sums.reduce((a, b) => a + b, 0) / data.sums.length;
        
        // Trouver les numéros les plus communs pour ce jour
        const numberFreq = new Map<number, number>();
        data.draws.flat().forEach((num: number) => {
          numberFreq.set(num, (numberFreq.get(num) || 0) + 1);
        });
        
        const mostCommon = Array.from(numberFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([num]) => num);

        return {
          day,
          averageSum,
          drawCount: data.draws.length,
          mostCommon,
        };
      });

      // Analyse des numéros consécutifs
      let hasConsecutive = 0, noConsecutive = 0;
      results.forEach(result => {
        const nums = result.winning_numbers.sort((a: number, b: number) => a - b);
        let foundConsecutive = false;
        for (let i = 0; i < nums.length - 1; i++) {
          if (nums[i + 1] === nums[i] + 1) {
            foundConsecutive = true;
            break;
          }
        }
        if (foundConsecutive) hasConsecutive++;
        else noConsecutive++;
      });

      return {
        topPairs,
        topTriplets,
        evenOddRatio: { even: evenCount, odd: oddCount },
        rangeDistribution,
        sumAnalysis,
        temporalPatterns,
        consecutiveNumbers: { hasConsecutive, noConsecutive },
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

function getEmptyStatistics(): AdvancedStatistics {
  return {
    topPairs: [],
    topTriplets: [],
    evenOddRatio: { even: 0, odd: 0 },
    rangeDistribution: [],
    sumAnalysis: { min: 0, max: 0, average: 0, median: 0 },
    temporalPatterns: [],
    consecutiveNumbers: { hasConsecutive: 0, noConsecutive: 0 },
  };
}
