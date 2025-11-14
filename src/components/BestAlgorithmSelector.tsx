import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useBestAlgorithm } from "@/hooks/useBestAlgorithm";
import { Crown, Award, TrendingUp, Info } from "lucide-react";

interface BestAlgorithmSelectorProps {
  drawName: string;
}

export const BestAlgorithmSelector = ({ drawName }: BestAlgorithmSelectorProps) => {
  const { data, isLoading } = useBestAlgorithm(drawName);

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.success || !data.recommendation) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Algorithme Recommandé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Aucune recommandation disponible pour ce tirage. 
              Plus de données historiques sont nécessaires.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { primary, alternatives } = data.recommendation;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-primary/20 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Algorithme Recommandé pour {drawName}
          </CardTitle>
          <CardDescription>
            Basé sur {data.totalAlgorithmsAnalyzed} algorithmes analysés
            {data.usingGlobalData && " (données globales utilisées)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Algorithme principal */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">{primary.algorithm}</h3>
              </div>
              <Badge className="text-lg px-3 py-1">
                Score: {(primary.score * 100).toFixed(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center p-2 rounded bg-background/50">
                <div className="text-xs text-muted-foreground">Précision Moy.</div>
                <div className="text-lg font-bold text-primary">
                  {primary.metrics.avgAccuracy.toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-2 rounded bg-background/50">
                <div className="text-xs text-muted-foreground">Meilleur Match</div>
                <div className="text-lg font-bold">
                  {primary.metrics.bestMatch}/5
                </div>
              </div>
              <div className="text-center p-2 rounded bg-background/50">
                <div className="text-xs text-muted-foreground">Prédictions</div>
                <div className="text-lg font-bold">
                  {primary.metrics.totalPredictions}
                </div>
              </div>
              <div className="text-center p-2 rounded bg-background/50">
                <div className="text-xs text-muted-foreground">Poids</div>
                <div className="text-lg font-bold text-accent">
                  {primary.weight.toFixed(2)}
                </div>
              </div>
            </div>

            {primary.config && Object.keys(primary.config.parameters).length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold">Paramètres optimisés:</span>{" "}
                {Object.keys(primary.config.parameters).join(", ")}
              </div>
            )}
          </div>

          {/* Algorithmes alternatifs */}
          {alternatives.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Award className="w-4 h-4" />
                Alternatives recommandées
              </h4>
              {alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{alt.algorithm}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Score: {(alt.score * 100).toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Poids: {alt.weight.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      Précision: <span className="font-semibold">{alt.metrics.avgAccuracy.toFixed(1)}%</span>
                    </div>
                    <div>
                      Best: <span className="font-semibold">{alt.metrics.bestMatch}/5</span>
                    </div>
                    <div>
                      Excellent: <span className="font-semibold">{alt.metrics.excellentPredictions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Alert>
            <TrendingUp className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Les algorithmes sont sélectionnés en fonction de leur précision historique, 
              du nombre de matchs parfaits, et du taux de prédictions excellentes (≥3/5).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
