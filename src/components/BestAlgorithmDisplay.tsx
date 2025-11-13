import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBestAlgorithm } from "@/hooks/useBestAlgorithm";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BestAlgorithmDisplayProps {
  drawName: string;
}

export const BestAlgorithmDisplay = ({ drawName }: BestAlgorithmDisplayProps) => {
  const { data, isLoading, error } = useBestAlgorithm(drawName);

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success) {
    return null;
  }

  const { primary, alternatives } = data.recommendation;

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Meilleur Algorithme Recommandé
        </CardTitle>
        <CardDescription>
          {data.usingGlobalData 
            ? "Basé sur les performances globales (données spécifiques insuffisantes)"
            : "Basé sur les performances pour ce tirage"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Recommendation */}
        <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                {primary.algorithm}
              </h3>
              <Badge variant="default" className="mt-1">
                Score: {(primary.score * 100).toFixed(1)}%
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              Poids: {primary.weight}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Précision:</span>
              <span className="font-medium">{primary.metrics.avgAccuracy.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Meilleur:</span>
              <span className="font-medium">{primary.metrics.bestMatch}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Prédictions:</span>
              <span className="font-medium">{primary.metrics.totalPredictions}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Excellentes:</span>
              <span className="font-medium">{primary.metrics.excellentPredictions}</span>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Alternatives</h4>
            <div className="space-y-2">
              {alternatives.map((alt, idx) => (
                <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{alt.algorithm}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(alt.score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Précision: {alt.metrics.avgAccuracy.toFixed(1)}%</span>
                    <span>Meilleur: {alt.metrics.bestMatch}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-2 border-t">
          💡 Le système sélectionne automatiquement l'algorithme optimal basé sur les performances historiques
        </p>
      </CardContent>
    </Card>
  );
};
