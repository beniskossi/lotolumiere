import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, Award, Calendar, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePredictionTracking } from "@/hooks/usePredictionTracking";
import { useUserFavorites } from "@/hooks/useUserFavorites";

export const PersonalPerformanceTracker = () => {
  const { user } = useAuth();
  const { data: trackingData } = usePredictionTracking(user?.id);
  const { data: favorites } = useUserFavorites(user?.id);

  // Calculer les statistiques personnelles
  const totalPredictions = trackingData?.length || 0;
  const correctPredictions = trackingData?.filter(t => t.matches >= 3).length || 0;
  const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;
  const bestMatch = Math.max(...(trackingData?.map(t => t.matches) || [0]));
  
  // Données pour les graphiques
  const performanceData = trackingData?.slice(-10).map((track, index) => ({
    name: `T${index + 1}`,
    matches: track.matches,
    accuracy: (track.matches / 5) * 100,
    date: new Date(track.created_at).toLocaleDateString()
  })) || [];

  const monthlyStats = trackingData?.reduce((acc, track) => {
    const month = new Date(track.created_at).toLocaleDateString('fr-FR', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, predictions: 0, successes: 0 };
    }
    acc[month].predictions++;
    if (track.matches >= 3) acc[month].successes++;
    return acc;
  }, {} as Record<string, any>) || {};

  const monthlyData = Object.values(monthlyStats);

  // Analyse des numéros favoris
  const favoriteNumbers = favorites?.flatMap(f => f.favorite_numbers) || [];
  const numberFrequency = favoriteNumbers.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const topFavorites = Object.entries(numberFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([num, count]) => ({ number: parseInt(num), count }));

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalPredictions}</p>
                <p className="text-xs text-muted-foreground">Prédictions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Précision</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{bestMatch}/5</p>
                <p className="text-xs text-muted-foreground">Meilleur score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{favorites?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Favoris</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Performances</CardTitle>
              <CardDescription>
                Vos 10 dernières prédictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload;
                      return data ? `${label} - ${data.date}` : label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="matches" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Numéros trouvés"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Niveau de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Précision globale</span>
                    <span>{accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  {accuracy >= 70 && <Badge className="bg-green-500">Expert</Badge>}
                  {accuracy >= 50 && accuracy < 70 && <Badge className="bg-blue-500">Avancé</Badge>}
                  {accuracy >= 30 && accuracy < 50 && <Badge className="bg-yellow-500">Intermédiaire</Badge>}
                  {accuracy < 30 && <Badge variant="secondary">Débutant</Badge>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objectifs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Prochains objectifs</p>
                  <div className="space-y-2 text-sm">
                    {totalPredictions < 10 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Faire 10 prédictions</span>
                      </div>
                    )}
                    {accuracy < 50 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span>Atteindre 50% de précision</span>
                      </div>
                    )}
                    {bestMatch < 4 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Trouver 4 numéros corrects</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendances Mensuelles</CardTitle>
              <CardDescription>
                Évolution de vos prédictions par mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="predictions" fill="hsl(var(--primary))" name="Prédictions" />
                  <Bar dataKey="successes" fill="hsl(var(--accent))" name="Succès" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de vos Numéros Favoris</CardTitle>
              <CardDescription>
                Les numéros que vous utilisez le plus souvent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {topFavorites.map(({ number, count }) => (
                  <div key={number} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-2">
                      {number}
                    </div>
                    <p className="text-xs text-muted-foreground">{count} fois</p>
                  </div>
                ))}
              </div>
              
              {topFavorites.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucun numéro favori enregistré
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};