import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberBall } from "@/components/NumberBall";
import { PredictionShareButton } from "@/components/PredictionShareButton";
import { SocialShare } from "@/components/SocialShare";
import { useLatestPrediction } from "@/hooks/usePredictions";
import { useGeneratePrediction } from "@/hooks/useGeneratePrediction";
import { useAdvancedPrediction } from "@/hooks/useAdvancedPrediction";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Brain, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PredictionSkeleton } from "@/components/LoadingSkeleton";

interface PredictionPanelProps {
  drawName: string;
}

export const PredictionPanel = ({ drawName }: PredictionPanelProps) => {
  const { toast } = useToast();
  const { data: latestPrediction, isLoading: predictionLoading } = useLatestPrediction(drawName);
  const { data: advancedPredictions } = useAdvancedPrediction(drawName);
  const generatePrediction = useGeneratePrediction();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const topAdvancedPrediction = advancedPredictions?.predictions?.[0];

  const handleGeneratePrediction = async () => {
    try {
      toast({
        title: "Génération en cours...",
        description: "Analyse des données historiques avec les modèles ML",
      });

      await generatePrediction.mutateAsync({ drawName });

      toast({
        title: "✓ Prédiction générée",
        description: "Nouvelle prédiction disponible",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer la prédiction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Prédictions Intelligentes
              </CardTitle>
              <CardDescription>
                Prédictions basées sur des algorithmes d'apprentissage automatique
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGeneratePrediction}
                disabled={generatePrediction.isPending}
                className="gap-2"
              >
                {generatePrediction.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Générer
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="gap-2"
              >
                <Brain className="w-4 h-4" />
                {showAdvanced ? "Masquer" : "Avancé"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {predictionLoading ? (
            <PredictionSkeleton />
          ) : (
            <div className="space-y-4">
              {latestPrediction ? (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-primary rounded-lg text-white">
                  <div className="mb-4">
                    <p className="text-sm opacity-90 mb-1">
                      Prédiction du {format(new Date(latestPrediction.prediction_date), "d MMMM yyyy", { locale: fr })}
                    </p>
                    <div className="flex items-center gap-4 text-xs opacity-80">
                      <span>Modèle: <strong>{latestPrediction.model_used}</strong></span>
                      {latestPrediction.confidence_score && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Confiance: <strong>{latestPrediction.confidence_score.toFixed(1)}%</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 flex-wrap justify-center mb-4">
                    {latestPrediction.predicted_numbers.map((num, idx) => (
                      <NumberBall key={`${num}-${idx}`} number={num} size="lg" />
                    ))}
                  </div>

                  <div className="flex justify-center gap-2 mb-4">
                    <PredictionShareButton
                      predictionId={latestPrediction.id}
                      drawName={drawName}
                      numbers={latestPrediction.predicted_numbers}
                      confidence={latestPrediction.confidence_score}
                    />
                    <SocialShare
                      title={`Prédiction ${drawName}`}
                      description={`Numéros prédits: ${latestPrediction.predicted_numbers.join(', ')}`}
                      numbers={latestPrediction.predicted_numbers}
                      drawName={drawName}
                    />
                  </div>

                  {latestPrediction.confidence_score && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Niveau de confiance</span>
                        <span className="font-bold">{latestPrediction.confidence_score.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={latestPrediction.confidence_score} 
                        className="h-2 bg-white/20"
                      />
                      <div className="text-xs opacity-80">
                        {latestPrediction.confidence_score >= 75 ? "🔥 Confiance élevée" : 
                         latestPrediction.confidence_score >= 60 ? "✓ Confiance moyenne" : 
                         "⚠️ Confiance modérée"}
                      </div>
                    </div>
                  )}
                </div>

                {latestPrediction.model_metadata && (
                  <Card className="bg-muted/50 border-muted">
                    <CardContent className="pt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Détails de l'analyse:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {Object.entries(latestPrediction.model_metadata).map(([key, value]) => (
                          <div key={key} className="p-2 bg-background rounded">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <p className="font-semibold text-foreground">
                              {typeof value === "number" ? value.toFixed(2) : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Aucune prédiction disponible pour le moment. 
                </p>
                <Button 
                  onClick={handleGeneratePrediction}
                  disabled={generatePrediction.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Générer la première prédiction
                </Button>
              </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-accent/10 border-accent/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Approche Hybride Multi-Modèles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-primary">Analyse de Fréquence Pondérée</p>
                <p className="text-xs text-muted-foreground">
                  Détection des numéros chauds avec boost de récence et seuil d'activité
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-success flex-shrink-0" />
              <div>
                <p className="font-semibold text-success">Patterns de Séquence</p>
                <p className="text-xs text-muted-foreground">
                  Analyse des paires et triplets fréquents pour identifier les associations
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-accent flex-shrink-0" />
              <div>
                <p className="font-semibold text-accent">Gap Analysis Avancée</p>
                <p className="text-xs text-muted-foreground">
                  Prédiction basée sur les écarts temporels et la variance des patterns
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>⚠️ Avertissement:</strong> Ces prédictions sont basées sur des analyses 
            statistiques historiques et ne garantissent aucun résultat. La loterie reste un 
            jeu de hasard où chaque tirage est totalement indépendant. Jouez de manière 
            responsable.
          </p>
        </CardContent>
      </Card>
      {/* Prédiction avancée */}
      {showAdvanced && topAdvancedPrediction && (
        <Card className="bg-gradient-accent text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Prédiction IA Avancée
            </CardTitle>
            <CardDescription className="text-white/80">
              {topAdvancedPrediction.algorithm} - Confiance: {Math.round(topAdvancedPrediction.confidence * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap justify-center mb-4">
              {topAdvancedPrediction.numbers.map((num, idx) => (
                <NumberBall key={`${num}-${idx}`} number={num} size="lg" />
              ))}
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {topAdvancedPrediction.factors.slice(0, 3).map((factor, idx) => (
                <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded">
                  {factor}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
