import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberBall } from "@/components/NumberBall";
import { useAdvancedPrediction } from "@/hooks/useAdvancedPrediction";
import { Loader2, Sparkles, Brain, BarChart3, Network, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnhancedPredictionCharts } from "./EnhancedPredictionCharts";

interface AdvancedPredictionPanelProps {
  drawName: string;
}

const categoryIcons = {
  statistical: BarChart3,
  ml: Brain,
  bayesian: Network,
  neural: TrendingUp,
  variance: Sparkles,
  lightgbm: Brain,
  catboost: Brain,
  transformer: Network,
};

const categoryColors = {
  statistical: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ml: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  bayesian: "bg-green-500/10 text-green-500 border-green-500/20",
  neural: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  variance: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  lightgbm: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  catboost: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  transformer: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export const AdvancedPredictionPanel = ({ drawName }: AdvancedPredictionPanelProps) => {
  const { data, isLoading, error } = useAdvancedPrediction(drawName);
  const predictions = data?.predictions;
  const warning = data?.warning;

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Calcul des prédictions avancées...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="py-12">
          <p className="text-destructive text-center">
            Erreur lors du chargement des prédictions avancées
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-primary text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <div>
              <CardTitle className="text-2xl">Prédictions IA Avancées</CardTitle>
              <CardDescription className="text-white/80">
                8 algorithmes d'intelligence artificielle pour maximiser vos chances
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {warning && (
        <Card className="bg-warning/10 border-warning/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-warning text-2xl">⚠️</div>
              <div>
                <p className="font-semibold text-warning mb-1">Attention</p>
                <p className="text-sm text-muted-foreground">{warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {predictions && predictions.length > 0 && (
        <EnhancedPredictionCharts predictions={predictions} />
      )}

      {predictions && predictions.length > 0 ? (
        <div className="grid gap-6">
          {predictions.map((prediction, index) => {
            const Icon = categoryIcons[prediction.category];
            const colorClass = categoryColors[prediction.category];
            const confidencePercent = Math.round(prediction.confidence * 100);

            return (
              <Card
                key={index}
                className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{prediction.algorithm}</CardTitle>
                        <CardDescription>
                          Score: {prediction.score.toFixed(2)} • Confiance: {confidencePercent}%
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={colorClass}>
                      #{index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Numéros Prédits
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {prediction.numbers.map((num, idx) => (
                        <NumberBall key={`${num}-${idx}`} number={num} size="lg" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Facteurs d'analyse
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {prediction.factors.map((factor, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Niveau de confiance</span>
                      <span className="font-medium">{confidencePercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          confidencePercent >= 70
                            ? "bg-success"
                            : confidencePercent >= 50
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="py-12">
            <p className="text-muted-foreground text-center">
              Aucune prédiction disponible. Données insuffisantes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
