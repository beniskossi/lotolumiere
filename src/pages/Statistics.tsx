import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, BarChart3, PieChart as PieChartIcon, Sparkles, Activity, Trophy } from "lucide-react";
import { Footer } from "@/components/Footer";
import { StatisticsCharts } from "@/components/StatisticsCharts";
import { AdvancedStatisticsPanel } from "@/components/AdvancedStatisticsPanel";
import { AlgorithmRankings } from "@/components/AlgorithmRankings";
import { useMostFrequentNumbers, useLeastFrequentNumbers, useMaxGapNumbers, useMinGapNumbers } from "@/hooks/useNumberStatistics";
import { DRAW_SCHEDULE } from "@/types/lottery";
import { StatisticsSkeleton } from "@/components/LoadingSkeleton";
import { UserNav } from "@/components/UserNav";

const Statistics = () => {
  const navigate = useNavigate();
  const allDraws = Object.values(DRAW_SCHEDULE).flat();
  const [selectedDraw, setSelectedDraw] = useState(allDraws[0].name);
  
  const { data: mostFrequent = [], isLoading: loadingMost } = useMostFrequentNumbers(selectedDraw, 90);
  const { data: leastFrequent = [], isLoading: loadingLeast } = useLeastFrequentNumbers(selectedDraw, 90);
  const { data: maxGapNumbers = [], isLoading: loadingGap } = useMaxGapNumbers(selectedDraw, 10);
  const { data: minGapNumbers = [], isLoading: loadingMinGap } = useMinGapNumbers(selectedDraw, 10);

  const loading = loadingMost || loadingLeast || loadingGap || loadingMinGap;
  const topNumbers = mostFrequent.slice(0, 10);
  const coldNumbers = leastFrequent.slice(0, 10);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-primary text-white py-6 sm:py-8 px-3 sm:px-4 shadow-lg safe-area-top">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 touch-target"
              onClick={() => navigate("/")}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Retour à l'accueil</span>
            </Button>
            <UserNav />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Statistiques Avancées</h1>
          </div>
          <p className="text-white/80 mt-2 text-sm sm:text-base">
            Analyse complète des tendances et fréquences des numéros
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        <Card className="bg-gradient-card border-border/50 animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Sélectionner un Tirage
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choisissez le tirage pour analyser les statistiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDraw} onValueChange={setSelectedDraw}>
              <SelectTrigger className="w-full sm:max-w-md touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh] overflow-y-auto">
                {allDraws.map((draw) => (
                  <SelectItem key={draw.name} value={draw.name}>
                    {draw.name} - {draw.day} {draw.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <StatisticsSkeleton />
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 h-auto">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Vue d'ensemble</span>
                <span className="xs:hidden">Vue</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Graphiques</span>
                <span className="xs:hidden">Graph.</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Analyse Avancée</span>
                <span className="xs:hidden">Analyse</span>
              </TabsTrigger>
              <TabsTrigger value="rankings" className="gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Classement IA</span>
                <span className="xs:hidden">IA</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-slide-up">
                <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-success text-base sm:text-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      Numéros Chauds
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Les 10 numéros les plus fréquents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 xs:grid-cols-5 gap-2 sm:gap-3">
                      {topNumbers.map((stat, idx) => (
                        <div
                          key={stat.number}
                          className="relative flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-success/10 border border-success/30 hover:scale-105 active:scale-95 transition-transform touch-target"
                        >
                          <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-success text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-success">
                            {stat.number}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {stat.frequency}x
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
                      <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      Numéros Froids
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Les 10 numéros les plus en retard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 xs:grid-cols-5 gap-2 sm:gap-3">
                      {coldNumbers.map((stat, idx) => (
                        <div
                          key={stat.number}
                          className="relative flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/30 hover:scale-105 active:scale-95 transition-transform touch-target"
                        >
                          <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-primary text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            {stat.number}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {stat.days_since_last}j
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    Écarts Maximums
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Les 10 numéros avec les plus grands écarts d'apparition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 xs:grid-cols-5 gap-2 sm:gap-3">
                    {maxGapNumbers.map((stat, idx) => (
                      <div
                        key={stat.number}
                        className="relative flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/30 hover:scale-105 active:scale-95 transition-transform touch-target"
                      >
                        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-destructive text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-destructive">
                          {stat.number}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {stat.days_since_last}j
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-success text-base sm:text-lg">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    Écarts Minimums
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Les 10 numéros avec les plus petits écarts d'apparition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 xs:grid-cols-5 gap-2 sm:gap-3">
                    {minGapNumbers.map((stat, idx) => (
                      <div
                        key={stat.number}
                        className="relative flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-success/10 border border-success/30 hover:scale-105 active:scale-95 transition-transform touch-target"
                      >
                        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-success text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-success">
                          {stat.number}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {stat.days_since_last}j
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-primary text-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-12 h-12" />
                    <div>
                      <h3 className="text-xl font-bold mb-1">Découvrez l'Analyse Avancée</h3>
                      <p className="text-white/80 text-sm">
                        Explorez les paires fréquentes, triplets, patterns temporels et bien plus encore
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="animate-fade-in">
              <StatisticsCharts
                mostFrequent={mostFrequent}
                leastFrequent={leastFrequent}
                drawName={selectedDraw}
              />
            </TabsContent>

            <TabsContent value="advanced" className="animate-fade-in">
              <AdvancedStatisticsPanel drawName={selectedDraw} />
            </TabsContent>

            <TabsContent value="rankings" className="animate-fade-in">
              <AlgorithmRankings drawName={selectedDraw} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Statistics;
