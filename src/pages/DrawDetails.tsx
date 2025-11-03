import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Search, BarChart3, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberBall } from "@/components/NumberBall";

const DrawDetails = () => {
  const { drawName } = useParams();
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockResults = [
    {
      date: "2025-11-03",
      winningNumbers: [12, 23, 45, 67, 89],
      machineNumbers: [5, 18, 34, 56, 78],
    },
    {
      date: "2025-11-02",
      winningNumbers: [7, 19, 33, 51, 72],
      machineNumbers: [11, 28, 42, 65, 81],
    },
    {
      date: "2025-11-01",
      winningNumbers: [3, 25, 38, 59, 84],
      machineNumbers: [14, 31, 47, 68, 90],
    },
  ];

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
          <h1 className="text-3xl font-bold">{decodeURIComponent(drawName || "")}</h1>
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
                    Résultats récents pour {decodeURIComponent(drawName || "")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-card border border-border/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {result.date}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Numéros Gagnants
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {result.winningNumbers.map((num) => (
                            <NumberBall key={num} number={num} size="md" />
                          ))}
                        </div>
                      </div>
                      {result.machineNumbers && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Numéros Machine
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {result.machineNumbers.map((num) => (
                              <NumberBall key={num} number={num} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Statistiques Avancées</CardTitle>
                <CardDescription>
                  Analyses détaillées des tendances et patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cette section contiendra des statistiques complètes : numéros les plus/moins
                  fréquents, écarts d'apparition, analyses par période, et bien plus encore.
                </p>
              </CardContent>
            </Card>
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
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Les prédictions seront générées en utilisant une combinaison de LightGBM,
                      CatBoost et Transformers pour une analyse multi-dimensionnelle des tendances.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Note : Les prédictions sont basées sur des analyses statistiques et ne
                    garantissent pas de résultats. La loterie reste un jeu de hasard.
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
