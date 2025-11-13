import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AlgorithmPrediction {
  algorithm: string;
  numbers: number[];
  confidence: number;
  recentAccuracy: number;
  rank: number;
}

interface ConsensusResult {
  numbers: number[];
  confidence: number;
  agreementScore: number;
}

export const useMultiAlgorithmComparison = (drawName: string) => {
  return useQuery({
    queryKey: ["multi-algorithm-comparison", drawName],
    queryFn: async () => {
      const { data: predictions } = await supabase
        .from("predictions")
        .select("*")
        .eq("draw_name", drawName)
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: performance } = await supabase
        .from("algorithm_performance")
        .select("model_used, accuracy_score")
        .eq("draw_name", drawName)
        .order("created_at", { ascending: false })
        .limit(50);

      const algoStats = performance?.reduce((acc, p) => {
        if (!acc[p.model_used]) acc[p.model_used] = [];
        acc[p.model_used].push(p.accuracy_score);
        return acc;
      }, {} as Record<string, number[]>) || {};

      const topAlgorithms: AlgorithmPrediction[] = Object.entries(algoStats)
        .map(([algo, scores]) => {
          const avgAccuracy = scores.reduce((a, b) => a + b, 0) / scores.length;
          const pred = predictions?.find(p => p.model_used === algo);
          return {
            algorithm: algo,
            numbers: pred?.predicted_numbers || [],
            confidence: pred?.confidence_score || 0,
            recentAccuracy: avgAccuracy,
            rank: 0
          };
        })
        .sort((a, b) => b.recentAccuracy - a.recentAccuracy)
        .slice(0, 3)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      const consensus = calculateConsensus(topAlgorithms);

      return { topAlgorithms, consensus };
    },
    staleTime: 3 * 60 * 1000,
  });
};

function calculateConsensus(algorithms: AlgorithmPrediction[]): ConsensusResult {
  const votes: Record<number, number> = {};
  
  algorithms.forEach(algo => {
    algo.numbers.forEach(num => {
      votes[num] = (votes[num] || 0) + algo.recentAccuracy;
    });
  });

  const consensusNumbers = Object.entries(votes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([num]) => parseInt(num));

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const topVotes = consensusNumbers.reduce((sum, num) => sum + votes[num], 0);
  const agreementScore = (topVotes / totalVotes) * 100;

  const avgConfidence = algorithms.reduce((sum, a) => sum + a.recentAccuracy, 0) / algorithms.length;

  return {
    numbers: consensusNumbers,
    confidence: avgConfidence,
    agreementScore
  };
}
