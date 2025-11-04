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
      <div className="bg-gradient-primary text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
            <UserNav />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Statistiques Avancées</h1>
          </div>
          <p className="text-white/80 mt-2">
            Analyse complète des tendances et fréquences des numéros
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 flex-1">
        <Card className="bg-gradient-card border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Sélectionner un Tirage
            </CardTitle>
            <CardDescription>
              Choisissez le tirage pour analyser les statistiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDraw} onValueChange={setSelectedDraw}>
              <SelectTrigger className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="charts" className="gap-2">
                <Activity className="w-4 h-4" />
                Graphiques
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Analyse Avancée
              </TabsTrigger>
              <TabsTrigger value="rankings" className="gap-2">
                <Trophy className="w-4 h-4" />
                Classement IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
                <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-success">
                      <TrendingUp className="w-5 h-5" />
                      Numéros Chauds
                    </CardTitle>
                    <CardDescription>
                      Les 10 numéros les plus fréquents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      {topNumbers.map((stat, idx) => (
                        <div
                          key={stat.number}
                          className="relative flex flex-col items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 hover:scale-105 transition-transform"
                        >
                          <div className="absolute -top-2 -right-2 bg-success text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="text-2xl font-bold text-success">
                            {stat.number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.frequency}x
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <PieChartIcon className="w-5 h-5" />
                      Numéros Froids
                    </CardTitle>
                    <CardDescription>
                      Les 10 numéros les plus en retard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      {coldNumbers.map((stat, idx) => (
                        <div
                          key={stat.number}
                          className="relative flex flex-col items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30 hover:scale-105 transition-transform"
                        >
                          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {stat.number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.days_since_last}j
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Activity className="w-5 h-5" />
                    Écarts Maximums
                  </CardTitle>
                  <CardDescription>
                    Les 10 numéros avec les plus grands écarts d'apparition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {maxGapNumbers.map((stat, idx) => (
                      <div
                        key={stat.number}
                        className="relative flex flex-col items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 hover:scale-105 transition-transform"
                      >
                        <div className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="text-2xl font-bold text-destructive">
                          {stat.number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.days_since_last} jours
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <Activity className="w-5 h-5" />
                    Écarts Minimums
                  </CardTitle>
                  <CardDescription>
                    Les 10 numéros avec les plus petits écarts d'apparition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {minGapNumbers.map((stat, idx) => (
                      <div
                        key={stat.number}
                        className="relative flex flex-col items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 hover:scale-105 transition-transform"
                      >
                        <div className="absolute -top-2 -right-2 bg-success text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="text-2xl font-bold text-success">
                          {stat.number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.days_since_last} jours
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
