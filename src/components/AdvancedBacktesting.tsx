import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CalendarIcon, Play, Download, TrendingUp, Target, Award } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BacktestResult {
  algorithm: string;
  period: string;
  totalPredictions: number;
  accuracy: number;
  bestMatch: number;
  avgConfidence: number;
  profitability: number;
  sharpeRatio: number;
}

interface BacktestConfig {
  algorithms: string[];
  startDate: Date;
  endDate: Date;
  drawName: string;
  strategy: string;
}

export const AdvancedBacktesting = () => {
  const [config, setConfig] = useState<BacktestConfig>({
    algorithms: [],
    startDate: new Date(2024, 0, 1),
    endDate: new Date(),
    drawName: "all",
    strategy: "top_confidence"
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult[]>([]);
  
  // Données simulées de performance historique
  const performanceData = [
    { date: "Jan", lightgbm: 78, catboost: 76, transformer: 74, neural: 72 },
    { date: "Fév", lightgbm: 79, catboost: 77, transformer: 75, neural: 73 },
    { date: "Mar", lightgbm: 81, catboost: 78, transformer: 76, neural: 74 },
    { date: "Avr", lightgbm: 80, catboost: 79, transformer: 77, neural: 75 },
    { date: "Mai", lightgbm: 82, catboost: 80, transformer: 78, neural: 76 },
    { date: "Jun", lightgbm: 83, catboost: 81, transformer: 79, neural: 77 }
  ];

  const algorithms = [
    "LightGBM Pro",
    "CatBoost Pro", 
    "Transformers Pro",
    "Neural LSTM",
    "Bayésien Avancé",
    "ARIMA Time Series"
  ];

  const strategies = [
    { value: "top_confidence", label: "Plus haute confiance" },
    { value: "consensus", label: "Consensus majoritaire" },
    { value: "weighted_avg", label: "Moyenne pondérée" },
    { value: "ensemble", label: "Ensemble adaptatif" }
  ];

  const runBacktest = async () => {
    setIsRunning(true);
    
    // Simuler le backtesting
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Générer des résultats simulés
    const mockResults: BacktestResult[] = config.algorithms.map(algo => ({
      algorithm: algo,
      period: `${format(config.startDate, "MMM yyyy", { locale: fr })} - ${format(config.endDate, "MMM yyyy", { locale: fr })}`,
      totalPredictions: Math.floor(Math.random() * 100) + 50,
      accuracy: Math.floor(Math.random() * 30) + 60,
      bestMatch: Math.floor(Math.random() * 3) + 3,
      avgConfidence: Math.floor(Math.random() * 20) + 70,
      profitability: (Math.random() - 0.3) * 100,
      sharpeRatio: Math.random() * 2
    }));
    
    setResults(mockResults.sort((a, b) => b.accuracy - a.accuracy));
    setIsRunning(false);
  };

  const exportResults = () => {
    const csv = [
      "Algorithme,Période,Prédictions,Précision,Meilleur Match,Confiance Moy,Rentabilité,Sharpe Ratio",
      ...results.map(r => 
        `${r.algorithm},${r.period},${r.totalPredictions},${r.accuracy}%,${r.bestMatch}/5,${r.avgConfidence}%,${r.profitability.toFixed(1)}%,${r.sharpeRatio.toFixed(2)}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest-results-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Backtesting Avancé
          </CardTitle>
          <CardDescription>
            Testez les performances historiques de vos algorithmes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithmes à tester</label>
              <Select 
                value={config.algorithms.join(",")} 
                onValueChange={(value) => 
                  setConfig(prev => ({ ...prev, algorithms: value ? value.split(",") : [] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner les algorithmes" />
                </SelectTrigger>
                <SelectContent>
                  {algorithms.map(algo => (
                    <SelectItem key={algo} value={algo}>
                      {algo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stratégie de sélection</label>
              <Select 
                value={config.strategy} 
                onValueChange={(value) => 
                  setConfig(prev => ({ ...prev, strategy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map(strategy => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(config.startDate, "dd/MM/yyyy", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.startDate}
                    onSelect={(date) => date && setConfig(prev => ({ ...prev, startDate: date }))}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(config.endDate, "dd/MM/yyyy", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.endDate}
                    onSelect={(date) => date && setConfig(prev => ({ ...prev, endDate: date }))}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runBacktest}
              disabled={isRunning || config.algorithms.length === 0}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Test en cours..." : "Lancer le backtest"}
            </Button>
            
            {results.length > 0 && (
              <Button variant="outline" onClick={exportResults} className="gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graphique de performance historique */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Performance Historique</CardTitle>
          <CardDescription>
            Évolution de la précision des algorithmes sur 6 mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="lightgbm" stroke="#8884d8" name="LightGBM" />
              <Line type="monotone" dataKey="catboost" stroke="#82ca9d" name="CatBoost" />
              <Line type="monotone" dataKey="transformer" stroke="#ffc658" name="Transformer" />
              <Line type="monotone" dataKey="neural" stroke="#ff7300" name="Neural" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Résultats du backtest */}
      {results.length > 0 && (
        <div className="space-y-4">
          <Card className="bg-gradient-primary text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Résultats du Backtest
              </CardTitle>
              <CardDescription className="text-white/80">
                Performance sur la période sélectionnée
              </CardDescription>
            </CardHeader>
          </Card>

          {results.map((result, index) => (
            <Card key={index} className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-lg">{result.algorithm}</h4>
                    <p className="text-sm text-muted-foreground">{result.period}</p>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{result.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Précision</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{result.bestMatch}/5</p>
                    <p className="text-xs text-muted-foreground">Meilleur match</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{result.avgConfidence}%</p>
                    <p className="text-xs text-muted-foreground">Confiance moy.</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${result.profitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.profitability > 0 ? '+' : ''}{result.profitability.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Rentabilité</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prédictions totales:</span>
                    <span className="font-medium">{result.totalPredictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ratio de Sharpe:</span>
                    <span className="font-medium">{result.sharpeRatio.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Graphique comparatif */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Comparaison des Performances</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="algorithm" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#8884d8" name="Précision %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};