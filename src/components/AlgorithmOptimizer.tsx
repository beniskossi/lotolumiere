import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings, Play, Pause, RotateCcw, TrendingUp, Zap } from "lucide-react";
import { useAutoTuning } from "@/hooks/useAutoTuning";
import { toast } from "sonner";

interface OptimizationConfig {
  autoTuning: boolean;
  learningRate: number;
  adaptiveWeights: boolean;
  performanceThreshold: number;
  retrainingInterval: number;
}

interface AlgorithmMetrics {
  name: string;
  currentAccuracy: number;
  targetAccuracy: number;
  learningRate: number;
  lastOptimization: string;
  status: "optimizing" | "stable" | "needs_attention";
}

export const AlgorithmOptimizer = () => {
  const [config, setConfig] = useState<OptimizationConfig>({
    autoTuning: true,
    learningRate: 0.01,
    adaptiveWeights: true,
    performanceThreshold: 70,
    retrainingInterval: 24
  });
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const autoTuning = useAutoTuning();
  
  // Métriques simulées des algorithmes
  const [algorithms, setAlgorithms] = useState<AlgorithmMetrics[]>([
    {
      name: "LightGBM Pro",
      currentAccuracy: 78.5,
      targetAccuracy: 82.0,
      learningRate: 0.015,
      lastOptimization: "2h ago",
      status: "optimizing"
    },
    {
      name: "Transformers Pro", 
      currentAccuracy: 76.2,
      targetAccuracy: 79.5,
      learningRate: 0.012,
      lastOptimization: "4h ago",
      status: "stable"
    },
    {
      name: "CatBoost Pro",
      currentAccuracy: 74.8,
      targetAccuracy: 78.0,
      learningRate: 0.018,
      lastOptimization: "1h ago",
      status: "needs_attention"
    }
  ]);

  useEffect(() => {
    if (config.autoTuning) {
      const interval = setInterval(() => {
        // Simuler l'optimisation automatique
        setAlgorithms(prev => prev.map(algo => ({
          ...algo,
          currentAccuracy: Math.min(
            algo.targetAccuracy,
            algo.currentAccuracy + (Math.random() * 0.5)
          )
        })));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [config.autoTuning]);

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      // Simuler le processus d'optimisation
      for (let i = 0; i <= 100; i += 10) {
        setOptimizationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Lancer l'auto-tuning réel
      await autoTuning.mutateAsync({ drawName: "all" });
      
      toast.success("Optimisation terminée avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'optimisation");
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
    }
  };

  const resetAlgorithm = (algorithmName: string) => {
    setAlgorithms(prev => prev.map(algo => 
      algo.name === algorithmName 
        ? { ...algo, currentAccuracy: 65, learningRate: 0.01, status: "optimizing" as const }
        : algo
    ));
    toast.info(`${algorithmName} réinitialisé`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimizing": return "bg-blue-500";
      case "stable": return "bg-green-500";
      case "needs_attention": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "optimizing": return "En optimisation";
      case "stable": return "Stable";
      case "needs_attention": return "Attention requise";
      default: return "Inconnu";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Optimiseur d'Algorithmes
          </CardTitle>
          <CardDescription>
            Optimisation automatique et réglage des hyperparamètres
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration globale */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h4 className="font-medium">Configuration Globale</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-tuning</label>
                <Switch
                  checked={config.autoTuning}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, autoTuning: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Poids adaptatifs</label>
                <Switch
                  checked={config.adaptiveWeights}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, adaptiveWeights: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Taux d'apprentissage: {config.learningRate}
                </label>
                <Slider
                  value={[config.learningRate]}
                  onValueChange={([value]) => 
                    setConfig(prev => ({ ...prev, learningRate: value }))
                  }
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Seuil de performance: {config.performanceThreshold}%
                </label>
                <Slider
                  value={[config.performanceThreshold]}
                  onValueChange={([value]) => 
                    setConfig(prev => ({ ...prev, performanceThreshold: value }))
                  }
                  min={50}
                  max={95}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Contrôles d'optimisation */}
          <div className="flex gap-2">
            <Button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="gap-2"
            >
              {isOptimizing ? (
                <>
                  <Pause className="w-4 h-4" />
                  Optimisation...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Lancer l'optimisation
                </>
              )}
            </Button>
            
            {config.autoTuning && (
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                Auto-tuning actif
              </Badge>
            )}
          </div>

          {/* Barre de progression */}
          {isOptimizing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Optimisation en cours...</span>
                <span>{optimizationProgress}%</span>
              </div>
              <Progress value={optimizationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métriques des algorithmes */}
      <div className="grid gap-4">
        {algorithms.map((algo, index) => (
          <Card key={index} className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium">{algo.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Dernière optimisation: {algo.lastOptimization}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(algo.status)} text-white border-0`}
                  >
                    {getStatusText(algo.status)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetAlgorithm(algo.name)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Précision actuelle</p>
                  <p className="text-2xl font-bold text-primary">
                    {algo.currentAccuracy.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Objectif</p>
                  <p className="text-2xl font-bold text-green-600">
                    {algo.targetAccuracy.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression vers l'objectif</span>
                  <span>
                    {((algo.currentAccuracy / algo.targetAccuracy) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={(algo.currentAccuracy / algo.targetAccuracy) * 100} 
                  className="h-2" 
                />
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span>Taux d'apprentissage</span>
                  <Badge variant="secondary">{algo.learningRate}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommandations */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Recommandations d'Optimisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p>• Augmenter le taux d'apprentissage pour CatBoost Pro</p>
            <p>• Réduire la complexité du modèle Transformers Pro</p>
            <p>• Activer la régularisation L2 pour LightGBM Pro</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};