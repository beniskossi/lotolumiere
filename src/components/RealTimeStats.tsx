import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Users, TrendingUp, Zap, Clock } from "lucide-react";

interface RealTimeData {
  activeUsers: number;
  totalPredictions: number;
  successRate: number;
  lastUpdate: string;
  trending: {
    number: number;
    frequency: number;
  }[];
}

export const RealTimeStats = () => {
  const [data, setData] = useState<RealTimeData>({
    activeUsers: 0,
    totalPredictions: 0,
    successRate: 0,
    lastUpdate: new Date().toISOString(),
    trending: []
  });
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simuler des données en temps réel
    const updateData = () => {
      setData(prev => ({
        activeUsers: Math.floor(Math.random() * 50) + 20,
        totalPredictions: prev.totalPredictions + Math.floor(Math.random() * 3),
        successRate: Math.floor(Math.random() * 30) + 40,
        lastUpdate: new Date().toISOString(),
        trending: Array.from({ length: 5 }, () => ({
          number: Math.floor(Math.random() * 90) + 1,
          frequency: Math.floor(Math.random() * 100) + 1
        })).sort((a, b) => b.frequency - a.frequency)
      }));
    };

    // Mise à jour initiale
    updateData();

    // Mise à jour toutes les 10 secondes si live
    const interval = setIsLive && isLive ? setInterval(updateData, 10000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Statistiques en Temps Réel
            </CardTitle>
            <CardDescription>
              Données mises à jour automatiquement
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
        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Utilisateurs</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{data.activeUsers}</p>
            <p className="text-xs text-muted-foreground">actifs</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Prédictions</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{data.totalPredictions}</p>
            <p className="text-xs text-muted-foreground">aujourd'hui</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Succès</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{data.successRate}%</p>
            <p className="text-xs text-muted-foreground">précision</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Dernière MAJ</span>
            </div>
            <p className="text-sm font-bold text-purple-600">{formatTime(data.lastUpdate)}</p>
          </div>
        </div>

        {/* Barre de progression du taux de succès */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Taux de succès global</span>
            <span>{data.successRate}%</span>
          </div>
          <Progress value={data.successRate} className="h-2" />
        </div>

        {/* Numéros tendance */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Numéros Tendance</h4>
          <div className="grid grid-cols-5 gap-2">
            {data.trending.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mx-auto mb-1">
                  {item.number}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.frequency}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex justify-center pt-4 border-t">
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLive ? "Mettre en pause" : "Reprendre"} les mises à jour
          </button>
        </div>
      </CardContent>
    </Card>
  );
};