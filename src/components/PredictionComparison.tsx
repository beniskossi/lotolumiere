import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberBall } from "@/components/NumberBall";
import { usePredictions } from "@/hooks/usePredictions";
import { useDrawResults } from "@/hooks/useDrawResults";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, XCircle, Target, TrendingUp, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PredictionComparisonProps {
  drawName: string;
}

export const PredictionComparison = ({ drawName }: PredictionComparisonProps) => {
  const { data: predictions, isLoading: predictionsLoading } = usePredictions(drawName, 10);
  const { data: results, isLoading: resultsLoading } = useDrawResults(drawName, 20);

  const comparePredictionWithResult = (prediction: any, predictionDate: string) => {
    if (!results) return null;

    // Find the next draw after the prediction date
    const nextDraw = results.find(
      (result) => new Date(result.draw_date) > new Date(predictionDate)
    );

    if (!nextDraw) return null;

    const matches = prediction.predicted_numbers.filter((num: number) =>
      nextDraw.winning_numbers.includes(num)
    );

    return {
      result: nextDraw,
      matches: matches.length,
      accuracy: (matches.length / prediction.predicted_numbers.length) * 100,
      matchedNumbers: matches,
    };
  };

  if (predictionsLoading || resultsLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Aucune prédiction à comparer pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall statistics
  const validComparisons = predictions?.map(p => comparePredictionWithResult(p, p.prediction_date)).filter(c => c) || [];
  const totalAccuracy = validComparisons.length > 0 
    ? validComparisons.reduce((sum, c) => sum + c!.accuracy, 0) / validComparisons.length 
    : 0;
  const totalMatches = validComparisons.reduce((sum, c) => sum + c!.matches, 0);
  const bestPrediction = validComparisons.length > 0 
    ? Math.max(...validComparisons.map(c => c!.matches)) 
    : 0;

  return (
    <div className="space-y-6">
      {validComparisons.length > 0 && (
        <Card className="bg-gradient-primary text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Statistiques de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-4 h-4" />
                  <p className="text-xs opacity-80">Précision Moyenne</p>
                </div>
                <p className="text-3xl font-bold">{totalAccuracy.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-xs opacity-80">Meilleure Performance</p>
                </div>
                <p className="text-3xl font-bold">{bestPrediction}/5</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-4 h-4" />
                  <p className="text-xs opacity-80">Total Numéros Trouvés</p>
                </div>
                <p className="text-3xl font-bold">{totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Comparaison Détaillée des Prédictions</CardTitle>
          <CardDescription>
            Analysez la performance de nos algorithmes de prédiction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map((prediction) => {
            const comparison = comparePredictionWithResult(prediction, prediction.prediction_date);

            if (!comparison) return null;

            return (
              <div
                key={prediction.id}
                className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Prédiction du{" "}
                      {format(new Date(prediction.prediction_date), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tirage du{" "}
                      {format(new Date(comparison.result.draw_date), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {comparison.accuracy.toFixed(0)}%
                    </p>
                    <Badge variant={comparison.matches >= 3 ? "default" : "secondary"}>
                      {comparison.matches}/5 trouvés
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Numéros Prédits
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {prediction.predicted_numbers.map((num: number, idx: number) => {
                      const isMatch = comparison.matchedNumbers.includes(num);
                      return (
                        <div key={`${num}-${idx}`} className="relative">
                          <NumberBall number={num} size="md" />
                          {isMatch ? (
                            <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-success bg-background rounded-full" />
                          ) : (
                            <XCircle className="absolute -top-1 -right-1 w-5 h-5 text-destructive/60 bg-background rounded-full" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Résultat Réel - Numéros Gagnants
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {comparison.result.winning_numbers.map((num: number, idx: number) => (
                        <NumberBall key={`${num}-${idx}`} number={num} size="md" />
                      ))}
                    </div>
                  </div>
                  {comparison.result.machine_numbers && comparison.result.machine_numbers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Numéros Machine
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {comparison.result.machine_numbers.map((num: number, idx: number) => (
                          <NumberBall key={`machine-${num}-${idx}`} number={num} size="sm" className="opacity-70" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {comparison.matches} numéro(s) correct(s) sur{" "}
                      {prediction.predicted_numbers.length}
                    </span>
                    <span className="font-medium">
                      {comparison.matches >= 3 ? "🔥 Excellent" : 
                       comparison.matches >= 2 ? "✓ Bon" : "⚠️ Faible"}
                    </span>
                  </div>
                  <Progress value={comparison.accuracy} className="h-2" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
