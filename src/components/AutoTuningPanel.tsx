import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useAutoTuning, 
  useAlgorithmConfigs, 
  useTrainingHistory,
  TuningResult 
} from "@/hooks/useAutoTuning";
import { Settings, TrendingUp, TrendingDown, RefreshCw, Info, Zap } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AutoTuningPanel = () => {
  const [lastResults, setLastResults] = useState<TuningResult[]>([]);
  const autoTuningMutation = useAutoTuning();
  const { data: configs, isLoading: configsLoading } = useAlgorithmConfigs();
  const { data: history, isLoading: historyLoading } = useTrainingHistory();

  const handleAutoTune = async () => {
    const result = await autoTuningMutation.mutateAsync(undefined);
    if (result.success) {
      setLastResults(result.results);
    }
  };

  if (configsLoading || historyLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
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
    <div className="space-y-6">
      {/* Panel de contrôle */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Auto-Tuning des Algorithmes
              </CardTitle>
              <CardDescription>
                Optimisation automatique des hyperparamètres basée sur les performances
              </CardDescription>
            </div>
            <Button
              onClick={handleAutoTune}
              disabled={autoTuningMutation.isPending}
              size="lg"
              className="gap-2"
            >
              {autoTuningMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Optimisation...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Lancer l'Auto-Tuning
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              L'auto-tuning analyse les performances historiques et ajuste automatiquement les hyperparamètres
              (learning rate, nombre d'arbres, dimensions, etc.) pour optimiser chaque algorithme.
            </AlertDescription>
          </Alert>

          {/* Résultats du dernier tuning */}
          {lastResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Derniers résultats d'optimisation</h3>
              <div className="grid gap-2">
                {lastResults.map((result) => (
                  <div
                    key={result.algorithm}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{result.displayName}</span>
                      <Badge 
                        variant={result.improvement >= 0 ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {result.improvement >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {result.improvement > 0 ? '+' : ''}{result.improvement.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span>Poids: </span>
                        <span className="font-mono">
                          {result.previousWeight.toFixed(2)} → {result.newWeight.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span>Params: </span>
                        <span className="font-semibold">{result.parametersChanged}</span>
                      </div>
                      <div>
                        <span>Précision: </span>
                        <span className="font-semibold text-primary">
                          {result.performance.avgAccuracy.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration actuelle */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Configuration Actuelle des Algorithmes</CardTitle>
          <CardDescription>
            Poids et paramètres optimisés pour chaque algorithme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Algorithme</TableHead>
                <TableHead className="text-center">Poids</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-center">Paramètres</TableHead>
                <TableHead>Dernière Mise à Jour</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs?.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    {config.algorithm_name}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={config.weight >= 1.5 ? "default" : config.weight >= 1.0 ? "secondary" : "outline"}
                    >
                      {config.weight.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={config.is_enabled ? "default" : "secondary"}>
                      {config.is_enabled ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground">
                      {Object.keys(config.parameters).length} params
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(config.updated_at), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historique d'entraînement */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Historique d'Optimisation</CardTitle>
          <CardDescription>
            Dernières sessions d'auto-tuning et leurs résultats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history?.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg bg-muted/20 border border-border/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">{entry.algorithm_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(new Date(entry.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <Badge 
                    variant={entry.performance_improvement >= 0 ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {entry.performance_improvement >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {entry.performance_improvement > 0 ? '+' : ''}
                    {entry.performance_improvement.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Poids: {entry.previous_weight.toFixed(2)} → {entry.new_weight.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
