import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrainAlgorithms, useTrainingHistory } from "@/hooks/useAlgorithmTraining";
import { Brain, TrendingUp, TrendingDown, RefreshCw, Activity, Clock, GitCompare, Undo2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrainingComparison } from "./TrainingComparison";
import { ConfigRollback } from "./ConfigRollback";

export const AlgorithmTraining = () => {
  const { data: history, isLoading, error } = useTrainingHistory();
  const trainMutation = useTrainAlgorithms();

  if (error) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="pt-6">
          <p className="text-destructive">Erreur lors du chargement de l'historique</p>
        </CardContent>
      </Card>
    );
  }

  const handleTrain = () => {
    trainMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Préparer les données pour le graphique d'évolution
  const chartData = history
    ?.slice(0, 20)
    .reverse()
    .map((h) => ({
      date: format(new Date(h.training_date), "dd/MM HH:mm", { locale: fr }),
      poids: h.new_weight,
      amélioration: h.performance_improvement,
      algorithme: h.algorithm_name.substring(0, 15),
    }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="training" className="gap-2">
            <Brain className="w-4 h-4" />
            Entraînement
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <GitCompare className="w-4 h-4" />
            Comparaison
          </TabsTrigger>
          <TabsTrigger value="rollback" className="gap-2">
            <Undo2 className="w-4 h-4" />
            Rollback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="mt-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Entraînement des Algorithmes
              </CardTitle>
              <CardDescription>
                Optimisation automatique des poids basée sur les performances
              </CardDescription>
            </div>
            <Button
              onClick={handleTrain}
              disabled={trainMutation.isPending}
              className="gap-2"
            >
              {trainMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Entraînement...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Lancer l'Entraînement
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Comment fonctionne l'entraînement ?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Analyse les performances historiques de chaque algorithme</li>
              <li>Calcule des métriques avancées (précision, rappel, F1-score)</li>
              <li>Ajuste automatiquement les poids selon les résultats</li>
              <li>Les algorithmes performants obtiennent plus d'influence</li>
              <li>Limite les ajustements à ±30% pour éviter les surréactions</li>
            </ul>
          </div>

          {!history || history.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucun historique d'entraînement disponible
              </p>
              <p className="text-sm text-muted-foreground">
                Lancez un premier entraînement pour optimiser vos algorithmes
              </p>
            </div>
          ) : (
            <>
              {chartData && chartData.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Évolution des Performances
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        label={{ value: "Amélioration (%)", angle: -90, position: "insideLeft" }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        label={{ value: "Poids", angle: 90, position: "insideRight" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="amélioration"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="Amélioration (%)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="poids"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        name="Poids"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Historique des Entraînements
                </h3>
                {history.map((record) => {
                  const isImprovement = record.performance_improvement > 0;
                  const isSignificant = Math.abs(record.performance_improvement) > 5;

                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-lg border bg-muted/30 border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {record.algorithm_name}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(record.training_date), "dd MMMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                        <Badge
                          variant={isSignificant ? "default" : "secondary"}
                          className={`gap-1 ${
                            isImprovement
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                        >
                          {isImprovement ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {record.performance_improvement > 0 ? "+" : ""}
                          {record.performance_improvement.toFixed(1)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-background/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground mb-1">Ancien Poids</p>
                          <p className="font-semibold">{record.previous_weight.toFixed(2)}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground mb-1">Nouveau Poids</p>
                          <p className="font-semibold text-primary">
                            {record.new_weight.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-background/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground mb-1">Précision Moy.</p>
                          <p className="font-semibold">
                            {record.training_metrics.avg_accuracy.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-background/50 p-2 rounded">
                          <p className="text-xs text-muted-foreground mb-1">F1-Score</p>
                          <p className="font-semibold">
                            {record.training_metrics.avg_f1_score.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <TrainingComparison />
        </TabsContent>

        <TabsContent value="rollback" className="mt-6">
          <ConfigRollback />
        </TabsContent>
      </Tabs>
    </div>
  );
};