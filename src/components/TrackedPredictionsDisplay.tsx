import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrackedPredictions } from "@/hooks/usePredictionTracking";
import { useAuth } from "@/hooks/useAuth";
import { NumberBall } from "./NumberBall";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

export const TrackedPredictionsDisplay = () => {
  const { user } = useAuth();
  const { data: trackedPredictions, isLoading } = useTrackedPredictions(user?.id);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!trackedPredictions || trackedPredictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique de Prédictions
          </CardTitle>
          <CardDescription>
            Aucune prédiction sauvegardée pour le moment
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historique de Prédictions
        </CardTitle>
        <CardDescription>
          Vos prédictions sauvegardées ({trackedPredictions.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {trackedPredictions.map((tracked: any) => (
          <div key={tracked.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline">{tracked.predictions.draw_name}</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Prédiction du {new Date(tracked.predictions.prediction_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Sauvegardé le {new Date(tracked.marked_at).toLocaleDateString()}
                </p>
                {tracked.predictions.confidence_score && (
                  <Badge variant="secondary" className="mt-1">
                    {Math.round(tracked.predictions.confidence_score * 100)}% confiance
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {tracked.predictions.predicted_numbers.map((num: number) => (
                <NumberBall key={num} number={num} />
              ))}
            </div>

            {tracked.notes && (
              <p className="text-sm text-muted-foreground italic">{tracked.notes}</p>
            )}

            <p className="text-xs text-muted-foreground">
              Modèle: {tracked.predictions.model_used}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};