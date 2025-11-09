import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAlgorithmPerformanceHistory } from "@/hooks/useAlgorithmRankings";
import { useEvaluatePredictions } from "@/hooks/useAlgorithmRankings";
import { Activity, CheckCircle, XCircle, TrendingUp, RefreshCw, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Liste complète des 9 algorithmes
const ALL_ALGORITHMS = [
  "Analyse Fréquentielle",
  "ML K-means",
  "Inférence Bayésienne",
  "Neural Network",
  "Analyse Variance",
  "LightGBM",
  "CatBoost",
  "Transformer",
  "ARIMA",
];

interface AlgorithmPerformanceTrackerProps {
  drawName?: string;
}

export const AlgorithmPerformanceTracker = ({ drawName }: AlgorithmPerformanceTrackerProps) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("all");
  const { data: performanceHistory, isLoading } = useAlgorithmPerformanceHistory(
    selectedAlgorithm === "all" ? undefined : selectedAlgorithm,
    drawName
  );
  const evaluateMutation = useEvaluatePredictions();

  const handleEvaluate = () => {
    evaluateMutation.mutate(drawName);
  };

  // Calculer les statistiques par algorithme
  const algorithmStats = ALL_ALGORITHMS.map(algo => {
    const algoHistory = performanceHistory?.filter(p => p.model_used === algo) || [];
    const totalPredictions = algoHistory.length;
    const avgAccuracy = totalPredictions > 0
      ? algoHistory.reduce((sum, p) => sum + p.accuracy_score, 0) / totalPredictions
      : 0;
    const bestMatch = totalPredictions > 0
      ? Math.max(...algoHistory.map(p => p.matches_count))
      : 0;
    const excellentPredictions = algoHistory.filter(p => p.matches_count >= 3).length;

    return {
      name: algo,
      totalPredictions,
      avgAccuracy,
      bestMatch,
      excellentPredictions,
      hasData: totalPredictions > 0,
    };
  });

  const totalTrackedAlgorithms = algorithmStats.filter(a => a.hasData).length;
  const missingAlgorithms = algorithmStats.filter(a => !a.hasData);

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Suivi de Performance des Algorithmes
              </CardTitle>
              <CardDescription>
                {totalTrackedAlgorithms}/{ALL_ALGORITHMS.length} algorithmes avec des données
              </CardDescription>
            </div>
            <Button
              onClick={handleEvaluate}
              disabled={evaluateMutation.isPending}
              variant="outline"
              size="sm"
            >
              {evaluateMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Évaluation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Évaluer
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {missingAlgorithms.length > 0 && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                <strong>{missingAlgorithms.length} algorithmes sans données:</strong>{" "}
                {missingAlgorithms.map(a => a.name).join(", ")}
                <br />
                <span className="text-xs text-muted-foreground">
                  Lancez une évaluation pour générer les statistiques
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrer par algorithme</label>
            <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les algorithmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les algorithmes</SelectItem>
                {ALL_ALGORITHMS.map(algo => (
                  <SelectItem key={algo} value={algo}>
                    {algo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {algorithmStats.map(stat => (
              <div
                key={stat.name}
                className={`p-4 rounded-lg border transition-all ${
                  stat.hasData
                    ? "bg-card border-border/50 hover:border-primary/50"
                    : "bg-muted/20 border-border/30 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{stat.name}</h4>
                  {stat.hasData ? (
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>

                {stat.hasData ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Prédictions:</span>
                      <Badge variant="secondary" className="text-xs">
                        {stat.totalPredictions}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Précision moy:</span>
                      <span className="font-semibold text-primary">
                        {stat.avgAccuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Meilleur:</span>
                      <span className="font-semibold">{stat.bestMatch}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Excellent (≥3):</span>
                      <span className="font-semibold text-accent">
                        {stat.excellentPredictions}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Aucune donnée de performance disponible
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedAlgorithm !== "all" && performanceHistory && performanceHistory.length > 0 && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">
              Historique détaillé: {selectedAlgorithm}
            </CardTitle>
            <CardDescription>
              {performanceHistory.length} évaluations récentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {performanceHistory.slice(0, 10).map((perf) => (
                <div
                  key={perf.id}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {format(new Date(perf.draw_date), "d MMM yyyy", { locale: fr })}
                      </span>
                      <Badge
                        variant={perf.matches_count >= 3 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {perf.matches_count}/5
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        {perf.accuracy_score.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Prédits: </span>
                      <span className="font-mono">{perf.predicted_numbers.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gagnants: </span>
                      <span className="font-mono">{perf.winning_numbers.join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
