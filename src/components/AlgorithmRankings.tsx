import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlgorithmRankings, useAlgorithmPerformanceHistory, useEvaluatePredictions } from "@/hooks/useAlgorithmRankings";
import { Trophy, TrendingUp, Target, Award, RefreshCw, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface AlgorithmRankingsProps {
  drawName?: string;
}

export const AlgorithmRankings = ({ drawName }: AlgorithmRankingsProps) => {
  const { data: rankings, isLoading } = useAlgorithmRankings(drawName);
  const evaluateMutation = useEvaluatePredictions();

  const handleEvaluate = () => {
    evaluateMutation.mutate(drawName);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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

  if (!rankings || rankings.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Classement des Algorithmes
          </CardTitle>
          <CardDescription>
            Aucune donnée de performance disponible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Lancez une évaluation pour voir les performances des algorithmes
            </p>
            <Button
              onClick={handleEvaluate}
              disabled={evaluateMutation.isPending}
            >
              {evaluateMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Évaluation en cours...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Évaluer les Prédictions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = rankings.map(r => ({
    name: r.model_used,
    precision: Number(r.avg_accuracy.toFixed(1)),
    predictions: r.total_predictions,
    matches: r.total_matches,
  }));

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Classement des Algorithmes
            </CardTitle>
            <CardDescription>
              Performance basée sur {rankings[0]?.total_predictions || 0} prédictions
            </CardDescription>
          </div>
          <Button
            onClick={handleEvaluate}
            disabled={evaluateMutation.isPending}
            variant="outline"
            size="sm"
          >
            {evaluateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ranking">Classement</TabsTrigger>
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="space-y-4">
            {rankings.map((ranking, index) => {
              const medalColor =
                index === 0
                  ? "text-yellow-500"
                  : index === 1
                  ? "text-gray-400"
                  : index === 2
                  ? "text-amber-700"
                  : "text-muted-foreground";

              return (
                <div
                  key={`${ranking.model_used}-${ranking.draw_name}`}
                  className={`p-4 rounded-lg border transition-all hover:shadow-glow ${
                    index === 0
                      ? "bg-primary/5 border-primary/50"
                      : "bg-card border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${medalColor}`}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{ranking.model_used}</h3>
                        <p className="text-sm text-muted-foreground">
                          {ranking.draw_name}
                        </p>
                      </div>
                    </div>
                    <Badge variant={index === 0 ? "default" : "secondary"} className="text-base px-3 py-1">
                      {ranking.avg_accuracy.toFixed(1)}% précision
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold">{ranking.total_predictions}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-success" />
                      <div>
                        <p className="text-muted-foreground">Bonnes (≥3)</p>
                        <p className="font-semibold text-success">{ranking.good_predictions}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-muted-foreground">Excellentes (≥4)</p>
                        <p className="font-semibold text-accent">{ranking.excellent_predictions}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-destructive" />
                      <div>
                        <p className="text-muted-foreground">Meilleur</p>
                        <p className="font-semibold">{ranking.best_match}/5</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Précision Moyenne par Algorithme
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="precision" fill="hsl(var(--primary))" name="Précision (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Nombre de Correspondances Totales
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="matches" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Correspondances"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
