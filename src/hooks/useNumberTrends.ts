import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, parseISO } from "date-fns";

export interface NumberTrendData {
  date: string;
  [key: string]: string | number;
}

export const useNumberTrends = (drawName: string, numbers: number[], days: number = 30) => {
  return useQuery({
    queryKey: ["number-trends", drawName, numbers, days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      const { data, error } = await supabase
        .from("draw_results")
        .select("draw_date, winning_numbers")
        .eq("draw_name", drawName)
        .gte("draw_date", startDate.toISOString().split('T')[0])
        .lte("draw_date", endDate.toISOString().split('T')[0])
        .order("draw_date", { ascending: true });

      if (error) throw error;

      // Group by date and count occurrences
      const trendMap = new Map<string, Record<number, number>>();
      
      data.forEach((result) => {
        const dateKey = result.draw_date;
        if (!trendMap.has(dateKey)) {
          trendMap.set(dateKey, {});
        }
        
        const dateData = trendMap.get(dateKey)!;
        result.winning_numbers.forEach((num: number) => {
          if (numbers.includes(num)) {
            dateData[num] = (dateData[num] || 0) + 1;
          }
        });
      });

      // Convert to array format for charts
      const trendData: NumberTrendData[] = Array.from(trendMap.entries()).map(([date, counts]) => {
        const entry: NumberTrendData = { date: format(parseISO(date), 'dd/MM') };
        numbers.forEach(num => {
          entry[`num_${num}`] = counts[num] || 0;
        });
        return entry;
      });

      return trendData;
    },
    enabled: numbers.length > 0,
  });
};

export const useNumberCorrelation = (drawName: string) => {
  return useQuery({
    queryKey: ["number-correlation", drawName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("draw_results")
        .select("winning_numbers")
        .eq("draw_name", drawName)
        .limit(100);

      if (error) throw error;

      // Build correlation matrix
      const correlationMatrix: Record<number, Record<number, number>> = {};
      
      // Initialize matrix
      for (let i = 1; i <= 90; i++) {
        correlationMatrix[i] = {};
        for (let j = 1; j <= 90; j++) {
          correlationMatrix[i][j] = 0;
        }
      }

      // Count co-occurrences
      data.forEach((result) => {
        const numbers = result.winning_numbers as number[];
        for (let i = 0; i < numbers.length; i++) {
          for (let j = i + 1; j < numbers.length; j++) {
            const num1 = numbers[i];
            const num2 = numbers[j];
            correlationMatrix[num1][num2]++;
            correlationMatrix[num2][num1]++;
          }
        }
      });

      // Get top correlations
      const topCorrelations: Array<{
        number1: number;
        number2: number;
        count: number;
      }> = [];

      for (let i = 1; i <= 90; i++) {
        for (let j = i + 1; j <= 90; j++) {
          if (correlationMatrix[i][j] > 0) {
            topCorrelations.push({
              number1: i,
              number2: j,
              count: correlationMatrix[i][j],
            });
          }
        }
      }

      return {
        matrix: correlationMatrix,
        topCorrelations: topCorrelations.sort((a, b) => b.count - a.count).slice(0, 50),
      };
    },
  });
};