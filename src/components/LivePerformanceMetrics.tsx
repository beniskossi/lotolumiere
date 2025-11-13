import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

interface PerformanceMetric {
  algorithm: string;
  currentAccuracy: number;
  trend: number;
  predictions24h: number;
  status: "excellent" | "good" | "average" | "poor";
}

interface LivePerformanceMetricsProps {
  drawName?: string;
}

export const LivePerformanceMetrics = ({ drawName }: LivePerformanceMetricsProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Initialiser les métriques
    const initialMetrics: PerformanceMetric[] = [
      { algorithm: "LightGBM Pro", currentAccuracy: 78.5, trend: 2.3, predictions24h: 45, status: "excellent" },
      { algorithm: "Transformers Pro", currentAccuracy: 76.2, trend: 1.8, predictions24h: 42, status: "good" },
      { algorithm: "CatBoost Pro", currentAccuracy: 74.8, trend: -0.5, predictions24h: 38, status: "good" },
      { algorithm: "Neural LSTM", currentAccuracy: 73.1, trend: -1.2, predictions24h: 35, status: "average" },
      { algorithm: "Bayésien", currentAccuracy: 71.9, trend: 0.8, predictions24h: 32, status: "average" }
    ];
    
    setMetrics(initialMetrics);
    
    // Générer des données de graphique
    const generateChartData = () => {
      const now = new Date();
      const data = [];
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: time.getHours() + 'h',
          lightgbm: 78 + Math.random() * 4 - 2,
          transformer: 76 + Math.random() * 4 - 2,
          catboost: 74 + Math.random() * 4 - 2,
          neural: 73 + Math.random() * 4 - 2
        });
      }
      return data;
    };
    
    setChartData(generateChartData());
  }, []);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        currentAccuracy: Math.max(60, Math.min(85, 
          metric.currentAccuracy + (Math.random() - 0.5) * 0.5
        )),
        trend: (Math.random() - 0.5) * 4,
        predictions24h: metric.predictions24h + Math.floor(Math.random() * 3)
      })));

      // Mettre à jour le graphique
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const lastPoint = prev[prev.length - 1];
        newData.push({
          time: new Date().getHours() + 'h',
          lightgbm: Math.max(60, Math.min(85, lastPoint.lightgbm + (Math.random() - 0.5) * 2)),
          transformer: Math.max(60, Math.min(85, lastPoint.transformer + (Math.random() - 0.5) * 2)),
          catboost: Math.max(60, Math.min(85, lastPoint.catboost + (Math.random() - 0.5) * 2)),
          neural: Math.max(60, Math.min(85, lastPoint.neural + (Math.random() - 0.5) * 2))
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-blue-500";
      case "average": return "bg-yellow-500";
      case "poor": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 1) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < -1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent": return "Excellent";
      case "good": return "Bon";
      case "average": return "Moyen";
      case "poor": return "Faible";
      default: return "Inconnu";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Métriques de Performance Live
              </CardTitle>
              <CardDescription>
                Suivi en temps réel des algorithmes {drawName && `pour ${drawName}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <Badge variant={isLive ? "default" : "secondary"}>
                {isLive ? "LIVE" : "PAUSE"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Graphique en temps réel */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis domain={[60, 85]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="lightgbm" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                  name="LightGBM"
                />
                <Line 
                  type="monotone" 
                  dataKey="transformer" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={false}
                  name="Transformer"
                />
                <Line 
                  type="monotone" 
                  dataKey="catboost" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  dot={false}
                  name="CatBoost"
                />
                <Line 
                  type="monotone" 
                  dataKey="neural" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={false}
                  name="Neural"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Métriques détaillées */}
          <div className="grid gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`} />
                    <span className="font-medium">{metric.algorithm}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <Badge variant="outline">
                    {getStatusText(metric.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {metric.currentAccuracy.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Précision</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Tendance 24h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {metric.predictions24h}
                    </p>
                    <p className="text-xs text-muted-foreground">Prédictions 24h</p>
                  </div>
                </div>

                <Progress value={metric.currentAccuracy} className="h-2" />
              </div>
            ))}
          </div>

          {/* Résumé global */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">Résumé Global</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Précision moyenne</p>
                <p className="font-bold">
                  {(metrics.reduce((sum, m) => sum + m.currentAccuracy, 0) / metrics.length).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Meilleur algorithme</p>
                <p className="font-bold">
                  {metrics.sort((a, b) => b.currentAccuracy - a.currentAccuracy)[0]?.algorithm.split(' ')[0]}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total prédictions</p>
                <p className="font-bold">
                  {metrics.reduce((sum, m) => sum + m.predictions24h, 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Algorithmes actifs</p>
                <p className="font-bold">
                  {metrics.filter(m => m.status !== "poor").length}/{metrics.length}
                </p>
              </div>
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsLive(!isLive)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLive ? "Mettre en pause" : "Reprendre"} le suivi en temps réel
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};