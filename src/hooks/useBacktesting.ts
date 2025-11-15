import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BacktestResult {
  algorithm: string;
  period: string;
  totalPredictions: number;
  accuracy: number;
  bestMatch: number;
  avgConfidence: number;
  profitability: number;
  sharpeRatio: number;
}

interface BacktestParams {
  algorithms: string[];
  startDate: Date;
  endDate: Date;
  drawName: string;
}

export const useBacktesting = (params: BacktestParams) => {
  return useQuery({
    queryKey: ["backtesting", params],
    queryFn: async (): Promise<BacktestResult[]> => {
      const { algorithms, startDate, endDate, drawName } = params;

      if (algorithms.length === 0) {
        return [];
      }

      // Récupérer les performances historiques
      const { data: performances, error } = await supabase
        .from("algorithm_performance")
        .select("*")
        .in("model_used", algorithms)
        .gte("draw_date", startDate.toISOString().split('T')[0])
        .lte("draw_date", endDate.toISOString().split('T')[0])
        .eq("draw_name", drawName === "all" ? undefined : drawName);

      if (error) throw error;

      // Agréger les résultats par algorithme
      const resultsByAlgo = algorithms.map(algo => {
        const algoPerformances = performances?.filter(p => p.model_used === algo) || [];
        
        if (algoPerformances.length === 0) {
          return {
            algorithm: algo,
            period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
            totalPredictions: 0,
            accuracy: 0,
            bestMatch: 0,
            avgConfidence: 0,
            profitability: 0,
            sharpeRatio: 0
          };
        }

        const totalPredictions = algoPerformances.length;
        const accuracy = algoPerformances.reduce((sum, p) => sum + Number(p.accuracy_score), 0) / totalPredictions;
        const bestMatch = Math.max(...algoPerformances.map(p => p.matches_count));
        const avgConfidence = algoPerformances.reduce((sum, p) => sum + Number(p.confidence_score || 0), 0) / totalPredictions;
        
        // Calculer la profitabilité (basée sur les matches)
        const profitability = algoPerformances.reduce((sum, p) => {
          // 5 matches = +100%, 4 = +50%, 3 = +10%, 2 = -10%, 1 = -30%, 0 = -50%
          const profit = p.matches_count >= 5 ? 100 :
                        p.matches_count === 4 ? 50 :
                        p.matches_count === 3 ? 10 :
                        p.matches_count === 2 ? -10 :
                        p.matches_count === 1 ? -30 : -50;
          return sum + profit;
        }, 0) / totalPredictions;

        // Calculer le Sharpe Ratio (rendement / volatilité)
        const returns = algoPerformances.map(p => Number(p.accuracy_score));
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

        return {
          algorithm: algo,
          period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
          totalPredictions,
          accuracy: Number(accuracy.toFixed(2)),
          bestMatch,
          avgConfidence: Number(avgConfidence.toFixed(2)),
          profitability: Number(profitability.toFixed(2)),
          sharpeRatio: Number(sharpeRatio.toFixed(2))
        };
      });

      return resultsByAlgo.sort((a, b) => b.accuracy - a.accuracy);
    },
    enabled: params.algorithms.length > 0,
  });
};
