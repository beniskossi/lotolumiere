import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAlgorithmPerformanceHistory } from "@/hooks/useAlgorithmRankings";
import { useEvaluatePredictions } from "@/hooks/useAlgorithmRankings";
import { Activity, CheckCircle, XCircle, TrendingUp, RefreshCw, Info, Filter, Trophy, Target } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types pour les données de performance
interface PerformanceRecord {
  id: string;
  model_used: string;
  draw_date: string;
  predicted_numbers: number[];
  winning_numbers: number[];
  matches_count: number;
  accuracy_score: number;
  confidence: number;
  execution_time?: number;
  data_points_used?: number;
}

// Types pour les statistiques d'algorithme
interface AlgorithmStats {
  name: string;
  totalPredictions: number;
  avgAccuracy: number;
  bestMatch: number;
  excellentPredictions: number;
  avgConfidence: number;
  avgExecutionTime: number;
  hitRate: number;
  hasData: boolean;
}

// Liste complète des algorithmes (maintenue dans un fichier séparé pour réutilisation)
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
] as const;

type AlgorithmName = typeof ALL_ALGORITHMS[number];

interface AlgorithmPerformanceTrackerProps {
  drawName?: string;
  showDetailedHistory?: boolean;
  maxHistoryItems?: number;
  className?: string;
}

export const AlgorithmPerformanceTracker = ({
  drawName,
  showDetailedHistory = true,
  maxHistoryItems = 10,
  className = ""
}: AlgorithmPerformanceTrackerProps) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | '90d'>('30d');

  const { data: performanceHistory, isLoading, error } = useAlgorithmPerformanceHistory(
    selectedAlgorithm === "all" ? undefined : selectedAlgorithm,
    drawName,
    timeRange
  );

  const evaluateMutation = useEvaluatePredictions();

  const handleEvaluate = () => {
    if (drawName) {
      evaluateMutation.mutate(drawName);
    }
  };

  // Calculer les statistiques par algorithme (optimisé avec useMemo)
  const algorithmStats: AlgorithmStats[] = useMemo(() => {
    if (!performanceHistory) return ALL_ALGORITHMS.map(algo => ({
      name: algo,
      totalPredictions: 0,
      avgAccuracy: 0,
      bestMatch: 0,
      excellentPredictions: 0,
      avgConfidence: 0,
      avgExecutionTime: 0,
      hitRate: 0,
      hasData: false,
    }));

    return ALL_ALGORITHMS.map((algo: AlgorithmName) => {
      const algoHistory = performanceHistory.filter(p => p.model_used === algo);
      const totalPredictions = algoHistory.length;

      if (totalPredictions === 0) {
        return {
          name: algo,
          totalPredictions: 0,
          avgAccuracy: 0,
          bestMatch: 0,
          excellentPredictions: 0,
          avgConfidence: 0,
          avgExecutionTime: 0,
          hitRate: 0,
          hasData: false,
        };
      }

      const avgAccuracy = algoHistory.reduce((sum, p) => sum + p.accuracy_score, 0) / totalPredictions;
      const bestMatch = Math.max(...algoHistory.map(p => p.matches_count));
      const excellentPredictions = algoHistory.filter(p => p.matches_count >= 3).length;
      const avgConfidence = algoHistory.reduce((sum, p) => sum + (p.confidence || 0), 0) / totalPredictions;
      const avgExecutionTime = algoHistory.reduce((sum, p) => sum + (p.execution_time || 0), 0) / totalPredictions;
      const hitRate = (algoHistory.filter(p => p.matches_count > 0).length / totalPredictions) * 100;

      return {
        name: algo,
        totalPredictions,
        avgAccuracy,
        bestMatch,
        excellentPredictions,
        avgConfidence,
        avgExecutionTime,
        hitRate,
        hasData: true,
      };
    });
  }, [performanceHistory]);

  // Calculer les statistiques globales
  const globalStats = useMemo(() => {
    const allData = performanceHistory || [];
    const totalPredictions = allData.length;
    const totalMatches = allData.reduce((sum, p) => sum + p.matches_count, 0);
    const avgAccuracy = totalPredictions > 0 
      ? allData.reduce((sum, p) => sum + p.accuracy_score, 0) / totalPredictions 
      : 0;
    const bestAlgorithm = algorithmStats
      .filter(a => a.hasData)
      .sort((a, b) => b.avgAccuracy - a.avgAccuracy)[0];

    return {
      totalPredictions,
      avgAccuracy,
      bestAlgorithm: bestAlgorithm?.name || "Aucun",
      totalAlgorithmsWithData: algorithmStats.filter(a => a.hasData).length,
    };
  }, [performanceHistory, algorithmStats]);

  const missingAlgorithms = algorithmStats.filter(a => !a.hasData);

  // Gérer l'erreur
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <Info className="w-4 h-4" />
        <AlertDescription>
          Une erreur est survenue lors du chargement des données de performance: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

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
    <div className={`space-y-4 ${className}`}>
      {/* Carte principale avec les indicateurs globaux */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Suivi de Performance des Algorithmes
              </CardTitle>
              <CardDescription>
                {globalStats.totalAlgorithmsWithData}/{ALL_ALGORITHMS.length} algorithmes avec des données
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleEvaluate}
                disabled={evaluateMutation.isPending || !drawName}
                variant="outline"
                size="sm"
                title={drawName ? "Évaluer les performances" : "Sélectionnez un tirage"}
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
          </div>
          
          {/* Indicateurs globaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{globalStats.avgAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Précision moyenne</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Target className="w-6 h-6 mx-auto text-success mb-1" />
              <div className="text-2xl font-bold">{globalStats.totalPredictions}</div>
              <div className="text-xs text-muted-foreground">Prédictions</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Trophy className="w-6 h-6 mx-auto text-warning mb-1" />
              <div className="text-lg font-bold truncate">{globalStats.bestAlgorithm}</div>
              <div className="text-xs text-muted-foreground">Meilleur algo</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto text-success mb-1" />
              <div className="text-2xl font-bold">{missingAlgorithms.length}</div>
              <div className="text-xs text-muted-foreground">Manquants</div>
            </div>
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

          {/* Filtre par algorithme */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtrer par algorithme
            </label>
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

          {/* Grille des algorithmes */}
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
                  <h4 className="font-semibold text-sm truncate">{stat.name}</h4>
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
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Confiance:</span>
                      <span className="font-semibold">
                        {stat.avgConfidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Taux de succès:</span>
                      <span className="font-semibold text-success">
                        {stat.hitRate.toFixed(1)}%
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

      {/* Historique détaillé */}
      {showDetailedHistory && selectedAlgorithm !== "all" && performanceHistory && performanceHistory.length > 0 && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Historique détaillé: {selectedAlgorithm}
            </CardTitle>
            <CardDescription>
              {performanceHistory.length} évaluations récentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {performanceHistory.slice(0, maxHistoryItems).map((perf) => (
                <div
                  key={perf.id}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
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
                      <div className="text-lg font-bold text-primary">
                        {perf.accuracy_score.toFixed(0)}%
                      </div>
                      {perf.confidence && (
                        <div className="text-xs text-muted-foreground">
                          Conf: {perf.confidence.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Prédits: </span>
                      <span className="font-mono bg-muted px-1 rounded">
                        {perf.predicted_numbers.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gagnants: </span>
                      <span className="font-mono bg-muted px-1 rounded">
                        {perf.winning_numbers.join(", ")}
                      </span>
                    </div>
                  </div>
                  {perf.execution_time && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Exécuté en {perf.execution_time}ms
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};