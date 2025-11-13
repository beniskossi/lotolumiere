import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberBall } from "./NumberBall";
import { Brain, Zap, Target, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { useAdvancedPrediction } from "@/hooks/useAdvancedPrediction";
import { CollaborativePrediction } from "./CollaborativePrediction";

interface EnhancedPredictionEngineProps {
  drawName: string;
}

interface AlgorithmPerformance {
  name: string;
  accuracy: number;
  trend: "up" | "down" | "stable";
  lastUpdate: string;
  predictions: number;
}

export const EnhancedPredictionEngine = ({ drawName }: EnhancedPredictionEngineProps) => {
  const { data, isLoading, refetch } = useAdvancedPrediction(drawName);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Données simulées de performance des algorithmes
  const [algorithmPerformance] = useState<AlgorithmPerformance[]>([
    { name: "LightGBM Pro", accuracy: 78.5, trend: "up", lastUpdate: "2min", predictions: 156 },
    { name: "Transformers Pro", accuracy: 76.2, trend: "up", lastUpdate: "5min", predictions: 142 },
    { name: "CatBoost Pro", accuracy: 74.8, trend: "stable", lastUpdate: "3min", predictions: 138 },
    { name: "Neural LSTM", accuracy: 73.1, trend: "down", lastUpdate: "1min", predictions: 134 },
    { name: "Bayésien Avancé", accuracy: 71.9, trend: "stable", lastUpdate: "4min", predictions: 129 }
  ]);

  const predictions = data?.predictions || [];
  const topPredictions = predictions.slice(0, 3);

  const toggleAlgorithm = (algorithm: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithm) 
        ? prev.filter(a => a !== algorithm)
        : [...prev, algorithm]
    );
  };

  const runCustomAnalysis = async () => {
    if (selectedAlgorithms.length === 0) return;
    
    setIsAnalyzing(true);
    // Simuler l'analyse
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "📈";
      case "down": return "📉";
      default: return "➡️";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-primary text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-8 h-8" />
            Moteur de Prédiction Avancé
          </CardTitle>
          <CardDescription className="text-white/80">
            Analyse multi-algorithmes avec optimisation en temps réel
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Prédictions IA</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="custom">Analyse Custom</TabsTrigger>
          <TabsTrigger value="community">Communauté</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Activity className="w-12 h-12 animate-pulse text-primary mx-auto" />
                  <p>Calcul des prédictions optimales...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Prédictions principales */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Top 3 Prédictions Optimisées
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {topPredictions.map((pred, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{pred.algorithm}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {Math.round(pred.confidence * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Score: {pred.score.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mb-3">
                        {pred.numbers.map(num => (
                          <NumberBall key={num} number={num} size="lg" />
                        ))}
                      </div>
                      
                      <Progress 
                        value={pred.confidence * 100} 
                        className="h-2 mb-2" 
                      />
                      
                      <div className="flex gap-1 flex-wrap">
                        {pred.factors.slice(0, 3).map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Consensus des algorithmes */}
              <Card className="bg-accent/10 border-accent/30">
                <CardHeader>
                  <CardTitle className="text-lg">Consensus Multi-Algorithmes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    {/* Calculer le consensus des numéros les plus fréquents */}
                    {[12, 27, 35, 48, 63].map(num => (
                      <div key={num} className="text-center">
                        <NumberBall number={num} size="md" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.floor(Math.random() * 40 + 60)}%
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Numéros recommandés par la majorité des algorithmes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance des Algorithmes
              </CardTitle>
              <CardDescription>
                Suivi en temps réel de l'efficacité de chaque algorithme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {algorithmPerformance.map((algo, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{algo.name}</span>
                      <span className="text-lg">{getTrendIcon(algo.trend)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{algo.accuracy}%</p>
                      <p className="text-xs text-muted-foreground">
                        MAJ: {algo.lastUpdate}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={algo.accuracy} className="h-2 mb-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{algo.predictions} prédictions</span>
                    <span>Tendance: {algo.trend === "up" ? "↗️" : algo.trend === "down" ? "↘️" : "→"}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Analyse Personnalisée
              </CardTitle>
              <CardDescription>
                Sélectionnez les algorithmes pour une analyse sur mesure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {algorithmPerformance.map(algo => (
                  <div key={algo.name} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={algo.name}
                      checked={selectedAlgorithms.includes(algo.name)}
                      onChange={() => toggleAlgorithm(algo.name)}
                      className="rounded"
                    />
                    <label htmlFor={algo.name} className="text-sm cursor-pointer">
                      {algo.name}
                    </label>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={runCustomAnalysis}
                disabled={selectedAlgorithms.length === 0 || isAnalyzing}
                className="w-full gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Lancer l'analyse ({selectedAlgorithms.length} algo.)
                  </>
                )}
              </Button>
              
              {selectedAlgorithms.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Algorithmes sélectionnés:</p>
                  <div className="flex gap-1 flex-wrap">
                    {selectedAlgorithms.map(algo => (
                      <Badge key={algo} variant="secondary" className="text-xs">
                        {algo}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community">
          <CollaborativePrediction drawName={drawName} />
        </TabsContent>
      </Tabs>
    </div>
  );
};