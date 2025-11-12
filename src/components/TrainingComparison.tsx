import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainingHistory } from "@/hooks/useAlgorithmTraining";
import { useTrainingComparison } from "@/hooks/useTrainingComparison";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GitCompare, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const TrainingComparison = () => {
  const { data: history, isLoading } = useTrainingHistory(undefined, 50);
  const [beforeDate, setBeforeDate] = useState<string>("");
  const [afterDate, setAfterDate] = useState<string>("");
  const { data: comparison, isLoading: comparisonLoading } = useTrainingComparison(
    beforeDate,
    afterDate
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length < 2) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            Comparaison d'Entraînements
          </CardTitle>
          <CardDescription>
            Pas assez d'historique disponible pour la comparaison
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Grouper par date d'entraînement
  const uniqueDates = Array.from(
    new Set(history.map((h) => h.training_date))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const chartData = comparison?.map((c) => ({
    name: c.algorithm_name.substring(0, 15),
    avant: parseFloat(c.before.overall_score.toFixed(3)),
    après: parseFloat(c.after.overall_score.toFixed(3)),
    amélioration: parseFloat(c.improvement.overall_change_pct.toFixed(1)),
  }));

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          Comparaison d'Entraînements
        </CardTitle>
        <CardDescription>
          Comparez les performances avant et après entraînement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Avant l'entraînement
            </label>
            <Select value={beforeDate} onValueChange={setBeforeDate}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une date" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDates.map((date) => (
                  <SelectItem key={`before-${date}`} value={date}>
                    {format(new Date(date), "dd MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Après l'entraînement
            </label>
            <Select value={afterDate} onValueChange={setAfterDate}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une date" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDates.map((date) => (
                  <SelectItem key={`after-${date}`} value={date}>
                    {format(new Date(date), "dd MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {comparisonLoading && (
          <Skeleton className="h-96 w-full" />
        )}

        {comparison && comparison.length > 0 && !comparisonLoading && (
          <>
            <div className="space-y-3">
              {comparison.map((comp) => {
                const isImprovement = comp.improvement.overall_change_pct > 0;
                const isSignificant =
                  Math.abs(comp.improvement.overall_change_pct) > 5;

                return (
                  <div
                    key={comp.algorithm_name}
                    className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{comp.algorithm_name}</h4>
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
                        {comp.improvement.overall_change_pct > 0 ? "+" : ""}
                        {comp.improvement.overall_change_pct.toFixed(1)}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-background/50 p-2 rounded">
                        <p className="text-xs text-muted-foreground mb-1">
                          Poids
                        </p>
                        <p className="font-semibold">
                          {comp.before.weight.toFixed(2)} →{" "}
                          {comp.after.weight.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-background/50 p-2 rounded">
                        <p className="text-xs text-muted-foreground mb-1">
                          Précision
                        </p>
                        <p className="font-semibold">
                          {(comp.before.avg_accuracy * 100).toFixed(1)}% →{" "}
                          {(comp.after.avg_accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-background/50 p-2 rounded">
                        <p className="text-xs text-muted-foreground mb-1">
                          F1-Score
                        </p>
                        <p className="font-semibold">
                          {comp.before.avg_f1_score.toFixed(2)} →{" "}
                          {comp.after.avg_f1_score.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-background/50 p-2 rounded">
                        <p className="text-xs text-muted-foreground mb-1">
                          Score Global
                        </p>
                        <p className="font-semibold text-primary">
                          {comp.before.overall_score.toFixed(2)} →{" "}
                          {comp.after.overall_score.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {chartData && chartData.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-4">
                  Vue d'ensemble des performances
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      domain={[0, 1]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="avant" fill="hsl(var(--muted))" name="Avant" />
                    <Bar dataKey="après" fill="hsl(var(--primary))" name="Après" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {!comparisonLoading && (!comparison || comparison.length === 0) && beforeDate && afterDate && (
          <div className="text-center py-8 text-muted-foreground">
            <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée de comparaison disponible pour ces dates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
