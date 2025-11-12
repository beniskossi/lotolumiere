import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrainingHistory } from "@/hooks/useAlgorithmTraining";
import { useConfigRollback } from "@/hooks/useConfigRollback";
import { Skeleton } from "@/components/ui/skeleton";
import { Undo2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const ConfigRollback = () => {
  const { data: history, isLoading } = useTrainingHistory(undefined, 20);
  const rollback = useConfigRollback();

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-primary" />
            Rollback de Configuration
          </CardTitle>
          <CardDescription>
            Aucun historique disponible pour le rollback
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Grouper par date d'entraînement
  const uniqueDates = Array.from(
    new Set(history.map((h) => h.training_date))
  ).map((date) => ({
    date,
    algorithms: history.filter((h) => h.training_date === date),
  }));

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Undo2 className="w-5 h-5 text-primary" />
          Rollback de Configuration
        </CardTitle>
        <CardDescription>
          Restaurez une configuration d'algorithmes précédente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention</AlertTitle>
          <AlertDescription>
            Le rollback restaurera les poids et paramètres d'algorithmes à leur
            état avant l'entraînement sélectionné. Cette action est irréversible.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {uniqueDates.slice(0, 10).map((group) => (
            <div
              key={group.date}
              className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">
                    {format(new Date(group.date), "dd MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {group.algorithms.length} algorithme(s) modifié(s)
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    rollback.mutate({ trainingDate: group.date })
                  }
                  disabled={rollback.isPending}
                  className="gap-2"
                >
                  <Undo2 className="w-4 h-4" />
                  Restaurer
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.algorithms.map((algo) => (
                  <div
                    key={algo.id}
                    className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                  >
                    {algo.algorithm_name}
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-background/50 p-2 rounded">
                  <p className="text-muted-foreground mb-1">Moy. Amélioration</p>
                  <p className="font-semibold">
                    {(
                      group.algorithms.reduce(
                        (sum, a) => sum + a.performance_improvement,
                        0
                      ) / group.algorithms.length
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="bg-background/50 p-2 rounded">
                  <p className="text-muted-foreground mb-1">Moy. Précision</p>
                  <p className="font-semibold">
                    {(
                      group.algorithms.reduce(
                        (sum, a) => sum + a.training_metrics.avg_accuracy,
                        0
                      ) / group.algorithms.length
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="bg-background/50 p-2 rounded">
                  <p className="text-muted-foreground mb-1">Moy. F1-Score</p>
                  <p className="font-semibold">
                    {(
                      group.algorithms.reduce(
                        (sum, a) => sum + a.training_metrics.avg_f1_score,
                        0
                      ) / group.algorithms.length
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
