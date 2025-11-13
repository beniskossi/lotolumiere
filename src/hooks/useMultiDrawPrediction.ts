import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DrawPrediction {
  drawName: string;
  drawTime: string;
  numbers: number[];
  confidence: number;
  strategy: string;
}

interface MultiDrawStrategy {
  predictions: DrawPrediction[];
  totalBudget: number;
  expectedReturn: number;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

export const useMultiDrawPrediction = (drawNames: string[]) => {
  return useQuery({
    queryKey: ["multi-draw-prediction", drawNames],
    queryFn: async (): Promise<MultiDrawStrategy> => {
      const predictions: DrawPrediction[] = [];

      for (const drawName of drawNames.slice(0, 3)) {
        const { data: results } = await supabase
          .from("draw_results")
          .select("winning_numbers")
          .eq("draw_name", drawName)
          .order("draw_date", { ascending: false })
          .limit(30);

        if (!results || results.length < 5) continue;

        const frequency: Record<number, number> = {};
        for (let i = 1; i <= 90; i++) frequency[i] = 0;
        
        results.forEach((r, idx) => {
          const weight = Math.exp(-idx * 0.1);
          r.winning_numbers?.forEach(num => {
            frequency[num] += weight;
          });
        });

        const topNumbers = Object.entries(frequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([num]) => parseInt(num));

        const avgFreq = Object.values(frequency).reduce((a, b) => a + b, 0) / 90;
        const variance = Object.values(frequency).reduce((sum, f) => sum + Math.pow(f - avgFreq, 2), 0) / 90;
        const confidence = Math.min(85, 40 + (variance / avgFreq) * 10);

        predictions.push({
          drawName,
          drawTime: "À venir",
          numbers: topNumbers,
          confidence,
          strategy: confidence > 70 ? "Agressif" : confidence > 55 ? "Équilibré" : "Conservateur"
        });
      }

      const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
      const totalBudget = predictions.length * 500;
      const expectedReturn = totalBudget * (avgConfidence / 100) * 1.5;
      const riskLevel = avgConfidence > 70 ? "low" : avgConfidence > 55 ? "medium" : "high";

      let recommendation = "";
      if (riskLevel === "low") {
        recommendation = "Stratégie recommandée: Jouer tous les tirages avec mise standard";
      } else if (riskLevel === "medium") {
        recommendation = "Stratégie recommandée: Concentrer sur les 2 tirages les plus confiants";
      } else {
        recommendation = "Stratégie recommandée: Attendre de meilleures opportunités";
      }

      return {
        predictions,
        totalBudget,
        expectedReturn,
        riskLevel,
        recommendation
      };
    },
    enabled: drawNames.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
