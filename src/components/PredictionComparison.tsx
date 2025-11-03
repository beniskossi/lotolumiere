import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberBall } from "@/components/NumberBall";
import { usePredictions } from "@/hooks/usePredictions";
import { useDrawResults } from "@/hooks/useDrawResults";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, XCircle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PredictionComparisonProps {
  drawName: string;
}

export const PredictionComparison = ({ drawName }: PredictionComparisonProps) => {
  const { data: predictions, isLoading: predictionsLoading } = usePredictions(drawName, 10);
  const { data: results, isLoading: resultsLoading } = useDrawResults(drawName, 20);

  const comparePredictionWithResult = (predictionDate: string, predictedNumbers: number[]) => {
    if (!results) return null;

    // Find the next draw after the prediction date
    const nextDraw = results.find(
      (result) => new Date(result.draw_date) > new Date(predictionDate)
    );

    if (!nextDraw) return null;

    const matches = predictedNumbers.filter((num) =>
      nextDraw.winning_numbers.includes(num)
    );

    return {
      draw: nextDraw,
      matches,
      accuracy: (matches.length / predictedNumbers.length) * 100,
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

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Précision des Prédictions
          </CardTitle>
          <CardDescription>
            Comparaison entre les prédictions et les résultats réels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map((prediction) => {
            const comparison = comparePredictionWithResult(
              prediction.prediction_date,
              prediction.predicted_numbers
            );

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
                      {format(new Date(comparison.draw.draw_date), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {comparison.accuracy.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">précision</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Numéros Prédits
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {prediction.predicted_numbers.map((num, idx) => {
                      const isMatch = comparison.matches.includes(num);
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
                      {comparison.draw.winning_numbers.map((num, idx) => (
                        <NumberBall key={`${num}-${idx}`} number={num} size="md" />
                      ))}
                    </div>
                  </div>
                  {comparison.draw.machine_numbers && comparison.draw.machine_numbers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Numéros Machine
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {comparison.draw.machine_numbers.map((num, idx) => (
                          <NumberBall key={`machine-${num}-${idx}`} number={num} size="sm" className="opacity-70" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {comparison.matches.length} numéro(s) correct(s) sur{" "}
                      {prediction.predicted_numbers.length}
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
