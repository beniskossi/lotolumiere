import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Search, BarChart3, Brain, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberBall } from "@/components/NumberBall";
import { useDrawResults, useRefreshResults } from "@/hooks/useDrawResults";
import { useMostFrequentNumbers, useLeastFrequentNumbers } from "@/hooks/useNumberStatistics";
import { useLatestPrediction } from "@/hooks/usePredictions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DrawDetails = () => {
  const { drawName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const refreshResults = useRefreshResults();

  const decodedDrawName = decodeURIComponent(drawName || "");
  
  const { data: results, isLoading: resultsLoading, refetch: refetchResults } = useDrawResults(decodedDrawName, 20);
  const { data: mostFrequent, isLoading: mostFrequentLoading } = useMostFrequentNumbers(decodedDrawName, 10);
  const { data: leastFrequent, isLoading: leastFrequentLoading } = useLeastFrequentNumbers(decodedDrawName, 10);
  const { data: latestPrediction, isLoading: predictionLoading } = useLatestPrediction(decodedDrawName);

  const handleRefresh = async () => {
    try {
      toast({
        title: "Mise à jour en cours...",
        description: "Récupération des derniers résultats",
      });
      
      await refreshResults();
      await refetchResults();
      
      toast({
        title: "✓ Mise à jour réussie",
        description: "Les résultats ont été actualisés",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les résultats",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{decodedDrawName}</h1>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="donnees" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="donnees" className="gap-2">
              <Database className="w-4 h-4" />
              Données
            </TabsTrigger>
            <TabsTrigger value="consulter" className="gap-2">
              <Search className="w-4 h-4" />
              Consulter
            </TabsTrigger>
            <TabsTrigger value="statistiques" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="prediction" className="gap-2">
              <Brain className="w-4 h-4" />
              Prédiction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donnees">
            <div className="space-y-4">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Historique des Tirages</CardTitle>
                  <CardDescription>
                    Résultats récents pour {decodedDrawName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resultsLoading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                  ) : results && results.length > 0 ? (
                    results.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 rounded-lg bg-card border border-border/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {format(new Date(result.draw_date), "EEEE d MMMM yyyy", { locale: fr })}
                          </span>
                          <span className="text-xs text-muted-foreground">{result.draw_time}</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Numéros Gagnants
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {result.winning_numbers.map((num, idx) => (
                              <NumberBall key={`${num}-${idx}`} number={num} size="md" />
                            ))}
                          </div>
                        </div>
                        {result.machine_numbers && result.machine_numbers.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Numéros Machine
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {result.machine_numbers.map((num, idx) => (
                                <NumberBall key={`${num}-${idx}`} number={num} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      Aucun résultat disponible. Cliquez sur "Actualiser" pour récupérer les derniers tirages.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consulter">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Consulter les Régularités</CardTitle>
                <CardDescription>
                  Analysez la fréquence d'apparition des numéros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cette fonctionnalité sera disponible prochainement. Elle vous permettra de voir
                  les associations de numéros et leurs fréquences d'apparition.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistiques">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-success">Numéros les Plus Fréquents</CardTitle>
                    <CardDescription>Top 10 des numéros qui sortent le plus</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mostFrequentLoading ? (
                      <p className="text-muted-foreground">Chargement...</p>
                    ) : mostFrequent && mostFrequent.length > 0 ? (
                      <div className="space-y-3">
                        {mostFrequent.map((stat, idx) => (
                          <div key={stat.id} className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-muted-foreground w-8">
                              #{idx + 1}
                            </span>
                            <NumberBall number={stat.number} size="md" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Fréquence: <span className="text-success font-bold">{stat.frequency}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Dernier: {stat.last_appearance ? format(new Date(stat.last_appearance), "dd/MM/yyyy") : "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucune statistique disponible</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Numéros les Moins Fréquents</CardTitle>
                    <CardDescription>Top 10 des numéros qui sortent le moins</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leastFrequentLoading ? (
                      <p className="text-muted-foreground">Chargement...</p>
                    ) : leastFrequent && leastFrequent.length > 0 ? (
                      <div className="space-y-3">
                        {leastFrequent.map((stat, idx) => (
                          <div key={stat.id} className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-muted-foreground w-8">
                              #{idx + 1}
                            </span>
                            <NumberBall number={stat.number} size="md" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Fréquence: <span className="text-destructive font-bold">{stat.frequency}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Écart: {stat.days_since_last} jours
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Aucune statistique disponible</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prediction">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Prédictions Intelligentes</CardTitle>
                <CardDescription>
                  Prédictions basées sur des algorithmes d'apprentissage automatique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictionLoading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                  ) : latestPrediction ? (
                    <div className="p-6 bg-accent/10 border-2 border-accent/30 rounded-lg">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Prédiction du {format(new Date(latestPrediction.prediction_date), "d MMMM yyyy", { locale: fr })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Modèle: <span className="font-medium">{latestPrediction.model_used}</span>
                          {latestPrediction.confidence_score && (
                            <> • Confiance: <span className="font-medium">{latestPrediction.confidence_score}%</span></>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-3 flex-wrap mb-4">
                        {latestPrediction.predicted_numbers.map((num, idx) => (
                          <NumberBall key={`${num}-${idx}`} number={num} size="lg" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 border border-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Aucune prédiction disponible pour le moment. Les prédictions seront générées automatiquement 
                        une fois que suffisamment de données historiques seront collectées.
                      </p>
                    </div>
                  )}
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Approche hybride multi-modèles:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                      <li><strong>LightGBM:</strong> Analyse statistique rapide des fréquences et écarts</li>
                      <li><strong>CatBoost:</strong> Validation des interactions entre numéros</li>
                      <li><strong>Transformers:</strong> Détection des tendances temporelles</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    ⚠️ Note : Les prédictions sont basées sur des analyses statistiques et ne garantissent pas de résultats. 
                    La loterie reste un jeu de hasard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DrawDetails;

