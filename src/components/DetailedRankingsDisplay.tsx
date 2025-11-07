import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDetailedRankings, useRefreshRankings } from "@/hooks/useDetailedRankings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target, Award, RefreshCw, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DRAW_SCHEDULE } from "@/types/lottery";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export const DetailedRankingsDisplay = () => {
  const [selectedDraw, setSelectedDraw] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "chart" | "radar">("table");
  
  const { data: rankings, isLoading } = useDetailedRankings(
    selectedDraw === "all" ? undefined : selectedDraw
  );
  const refreshRankings = useRefreshRankings();

  const allDraws = Object.values(DRAW_SCHEDULE).flat();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Chargement des classements...</p>
        </CardContent>
      </Card>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Classements Détaillés
          </CardTitle>
          <CardDescription>
            Aucune donnée de performance disponible
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = rankings.slice(0, 10).map(r => ({
    name: r.model_used.substring(0, 20),
    score: r.overall_score,
    précision: r.avg_accuracy,
    consistance: r.consistency_score,
    "F1-Score": r.f1_score,
    rappel: r.recall_rate,
  }));

  // Prepare radar chart data
  const radarData = rankings.slice(0, 5).map(r => ({
    algorithm: r.model_used.substring(0, 15),
    'Score Global': r.overall_score,
    'Précision': r.precision_rate,
    'Rappel': r.recall_rate,
    'F1-Score': r.f1_score,
    'Consistance': r.consistency_score,
  }));

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <Award className="w-4 h-4 text-muted-foreground" />;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-blue-500">Bon</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-500">Moyen</Badge>;
    return <Badge variant="destructive">Faible</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Classement des Algorithmes
              </CardTitle>
              <CardDescription>
                Performance détaillée avec scoring avancé
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Vue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Tableau</SelectItem>
                  <SelectItem value="chart">Graphique</SelectItem>
                  <SelectItem value="radar">Radar</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshRankings.mutate()}
                disabled={refreshRankings.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshRankings.isPending ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedDraw} onValueChange={setSelectedDraw}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par tirage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tirages</SelectItem>
                {allDraws.map(draw => (
                  <SelectItem key={draw.name} value={draw.name}>
                    {draw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {viewMode === "chart" && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="score" fill="hsl(var(--primary))" name="Score Global" />
                <Bar dataKey="précision" fill="hsl(var(--accent))" name="Précision" />
                <Bar dataKey="rappel" fill="hsl(var(--secondary))" name="Rappel" />
                <Bar dataKey="F1-Score" fill="hsl(var(--success))" name="F1-Score" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {viewMode === "radar" && (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis 
                  dataKey="algorithm" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar 
                  name="Métriques de Performance" 
                  dataKey="Score Global" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {viewMode === "table" && (
            <div className="space-y-3">
              {rankings.map((ranking, index) => (
                <div
                  key={`${ranking.model_used}-${ranking.draw_name}`}
                  className={`p-4 rounded-lg border transition-all ${
                    index < 3 
                      ? 'bg-gradient-primary/10 border-primary/30 shadow-lg' 
                      : 'bg-muted/30 border-border/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">
                            {ranking.model_used}
                          </h3>
                          {getScoreBadge(ranking.overall_score)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ranking.draw_name} • {ranking.total_predictions} prédictions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {ranking.overall_score}
                      </div>
                      <p className="text-xs text-muted-foreground">Score Global</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                    <div className="bg-background/50 p-2 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-primary" />
                        <p className="text-xs text-muted-foreground">Précision</p>
                      </div>
                      <p className="text-lg font-semibold">{ranking.precision_rate.toFixed(1)}%</p>
                    </div>

                    <div className="bg-background/50 p-2 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-accent" />
                        <p className="text-xs text-muted-foreground">Rappel</p>
                      </div>
                      <p className="text-lg font-semibold">{ranking.recall_rate.toFixed(1)}%</p>
                    </div>

                    <div className="bg-background/50 p-2 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <p className="text-xs text-muted-foreground">F1-Score</p>
                      </div>
                      <p className="text-lg font-semibold">{ranking.f1_score.toFixed(1)}</p>
                    </div>

                    <div className="bg-background/50 p-2 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <p className="text-xs text-muted-foreground">Meilleur</p>
                      </div>
                      <p className="text-lg font-semibold">{ranking.best_match}/5</p>
                    </div>

                    <div className="bg-background/50 p-2 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <Award className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-muted-foreground">Excellents</p>
                      </div>
                      <p className="text-lg font-semibold">{ranking.excellent_predictions}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Performance Globale</span>
                        <span className="font-medium">{ranking.overall_score}/100</span>
                      </div>
                      <Progress value={ranking.overall_score} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-1 bg-green-500/10 rounded">
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          {ranking.excellent_predictions}
                        </p>
                        <p className="text-muted-foreground">Excellent (≥3)</p>
                      </div>
                      <div className="text-center p-1 bg-blue-500/10 rounded">
                        <p className="text-blue-600 dark:text-blue-400 font-semibold">
                          {ranking.outstanding_predictions}
                        </p>
                        <p className="text-muted-foreground">Exceptionnel (≥4)</p>
                      </div>
                      <div className="text-center p-1 bg-yellow-500/10 rounded">
                        <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                          {ranking.perfect_predictions}
                        </p>
                        <p className="text-muted-foreground">Parfait (5/5)</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend explaining the scoring */}
      <Card className="bg-muted/30 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Système de Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="text-muted-foreground">
            Le <strong>Score Global</strong> est calculé selon :
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li>35% - Précision moyenne des prédictions</li>
            <li>25% - Taux de prédictions excellentes (≥3 numéros)</li>
            <li>15% - Meilleure performance atteinte</li>
            <li>15% - F1-Score (balance précision/rappel)</li>
            <li>10% - Score de consistance (régularité)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
