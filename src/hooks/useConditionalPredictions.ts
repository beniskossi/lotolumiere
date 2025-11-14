import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConditionalRule {
  condition: number;
  consequence: number;
  probability: number;
  occurrences: number;
  confidence: "high" | "medium" | "low";
}

interface WinningCombination {
  numbers: number[];
  frequency: number;
  lastSeen: string;
  score: number;
}

export const useConditionalPredictions = (drawName: string) => {
  return useQuery({
    queryKey: ["conditional-predictions", drawName],
    queryFn: async () => {
      const { data: results } = await supabase
        .from("draw_results")
        .select("winning_numbers, draw_date")
        .eq("draw_name", drawName)
        .order("draw_date", { ascending: false })
        .limit(100);

      if (!results || results.length < 10) {
        return { rules: [], combinations: [] };
      }

      const rules = findConditionalRules(results);
      const combinations = findWinningCombinations(results);

      return { rules, combinations };
    },
    staleTime: 10 * 60 * 1000,
  });
};

function findConditionalRules(results: any[]): ConditionalRule[] {
  const pairs: Record<string, { count: number; total: number }> = {};

  results.forEach(result => {
    const numbers = result.winning_numbers || [];
    numbers.forEach((num1: number) => {
      numbers.forEach((num2: number) => {
        if (num1 !== num2) {
          const key = `${num1}-${num2}`;
          if (!pairs[key]) pairs[key] = { count: 0, total: 0 };
          pairs[key].count++;
        }
      });
      
      const totalWithNum1 = results.filter(r => r.winning_numbers?.includes(num1)).length;
      numbers.forEach((num2: number) => {
        if (num1 !== num2) {
          const key = `${num1}-${num2}`;
          pairs[key].total = totalWithNum1;
        }
      });
    });
  });

  return Object.entries(pairs)
    .map(([key, data]) => {
      const [condition, consequence] = key.split("-").map(Number);
      const probability = (data.count / data.total) * 100;
      const confidence: "high" | "medium" | "low" = 
        probability >= 70 ? "high" : probability >= 50 ? "medium" : "low";
      
      return {
        condition,
        consequence,
        probability,
        occurrences: data.count,
        confidence
      };
    })
    .filter(rule => rule.probability >= 40)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10);
}

function findWinningCombinations(results: any[]): WinningCombination[] {
  const combos: Record<string, { count: number; lastSeen: string }> = {};

  results.forEach(result => {
    const numbers = result.winning_numbers || [];
    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const key = [numbers[i], numbers[j]].sort((a, b) => a - b).join("-");
        if (!combos[key]) combos[key] = { count: 0, lastSeen: result.draw_date };
        combos[key].count++;
        if (result.draw_date > combos[key].lastSeen) {
          combos[key].lastSeen = result.draw_date;
        }
      }
    }
  });

  return Object.entries(combos)
    .map(([key, data]) => {
      const numbers = key.split("-").map(Number);
      const frequency = (data.count / results.length) * 100;
      const daysSince = Math.floor((Date.now() - new Date(data.lastSeen).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.exp(-daysSince / 30);
      const score = frequency * recencyScore;

      return {
        numbers,
        frequency: data.count,
        lastSeen: data.lastSeen,
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
