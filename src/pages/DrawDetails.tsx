import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Search, BarChart3, Brain, RefreshCw, Sparkles, Info, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberBall } from "@/components/NumberBall";
import { NumberConsult } from "@/components/NumberConsult";
import { PredictionPanel } from "@/components/PredictionPanel";
import { StatisticsCharts } from "@/components/StatisticsCharts";
import { AdvancedPredictionPanel } from "@/components/AdvancedPredictionPanel";
import { AdvancedStatisticsPanel } from "@/components/AdvancedStatisticsPanel";
import { AlgorithmRankings } from "@/components/AlgorithmRankings";
import { EnhancedPredictionEngine } from "@/components/EnhancedPredictionEngine";
import { AlgorithmOptimizer } from "@/components/AlgorithmOptimizer";
import { AdvancedBacktesting } from "@/components/AdvancedBacktesting";
import { HowItWorks } from "@/components/HowItWorks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { BestAlgorithmSelector } from "@/components/BestAlgorithmSelector";
import { useDrawResults, useRefreshResults } from "@/hooks/useDrawResults";
import { useMostFrequentNumbers, useLeastFrequentNumbers } from "@/hooks/useNumberStatistics";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DrawResultsSkeleton, StatisticsSkeleton } from "@/components/LoadingSkeleton";
import { PredictionComparison } from "@/components/PredictionComparison";
import { UserNav } from "@/components/UserNav";

const DrawDetails = () => {
  const { drawName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const refreshResults = useRefreshResults();

  const decodedDrawName = decodeURIComponent(drawName || "");
  
  const { data: results, isLoading: resultsLoading, refetch: refetchResults } = useDrawResults(decodedDrawName, 20);
  const { data: mostFrequent, isLoading: mostFrequentLoading } = useMostFrequentNumbers(decodedDrawName, 10);
  const { data: leastFrequent, isLoading: leastFrequentLoading } = useLeastFrequentNumbers(decodedDrawName, 10);

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
      <div className="bg-gradient-primary text-white py-6 sm:py-12 px-3 sm:px-4 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-accent opacity-10"></div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1 sm:gap-2 z-20">
          <ThemeToggle />
          <UserNav />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4 sm:mb-6 transition-all"
            onClick={() => navigate("/")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Retour à l'accueil</span>
            <span className="xs:hidden">Retour</span>
          </Button>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="animate-fade-in">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">{decodedDrawName}</h1>
              <p className="text-white/80 text-xs sm:text-sm">
                Analyse complète et prédictions intelligentes
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              className="gap-2 shadow-lg w-full sm:w-auto"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden xs:inline">Actualiser les données</span>
              <span className="xs:hidden">Actualiser</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="donnees" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-4 sm:mb-8 h-auto gap-1 text-[10px] sm:text-xs p-1">
            <TabsTrigger value="donnees" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Données</span>
            </TabsTrigger>
            <TabsTrigger value="consulter" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Consulter</span>
            </TabsTrigger>
            <TabsTrigger value="statistiques" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="prediction" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Prédiction</span>
            </TabsTrigger>
            <TabsTrigger value="ia-engine" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Optim.</span>
            </TabsTrigger>
            <TabsTrigger value="backtest" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger value="aide" className="gap-0.5 sm:gap-1 px-1 sm:px-3">
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Aide</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donnees">
            <div className="space-y-4">
              {resultsLoading ? (
                <DrawResultsSkeleton />
              ) : (
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle>Historique des Tirages</CardTitle>
                    <CardDescription>
                      Résultats récents pour {decodedDrawName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {results && results.length > 0 ? (
                      results.map((result) => (
                        <div
                          key={result.id}
                          className="p-3 sm:p-4 rounded-lg bg-card border border-border/50 space-y-2 sm:space-y-3 hover:border-primary/50 transition-all"
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
              )}
            </div>
          </TabsContent>

          <TabsContent value="consulter">
            <NumberConsult drawName={decodedDrawName} />
          </TabsContent>

          <TabsContent value="statistiques">
            <div className="space-y-6">
              {mostFrequent && leastFrequent && mostFrequent.length > 0 && leastFrequent.length > 0 && (
                <StatisticsCharts 
                  mostFrequent={mostFrequent} 
                  leastFrequent={leastFrequent}
                  drawName={decodedDrawName}
                />
              )}
              {mostFrequentLoading || leastFrequentLoading ? (
                <StatisticsSkeleton />
              ) : (
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
              )}
            </div>
          </TabsContent>



          <TabsContent value="prediction">
            <div className="space-y-6">
              <PredictionPanel drawName={decodedDrawName} />
              <PredictionComparison drawName={decodedDrawName} />
            </div>
          </TabsContent>

          <TabsContent value="ia-engine">
            <EnhancedPredictionEngine drawName={decodedDrawName} />
          </TabsContent>

          <TabsContent value="optimizer">
            <AlgorithmOptimizer />
          </TabsContent>

          <TabsContent value="backtest">
            <AdvancedBacktesting />
          </TabsContent>

          <TabsContent value="aide">
            <HowItWorks />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default DrawDetails;

