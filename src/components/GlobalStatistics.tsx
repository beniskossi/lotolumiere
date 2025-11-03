import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalStatistics } from "@/hooks/useGlobalStatistics";
import { NumberBall } from "@/components/NumberBall";
import { Database, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const GlobalStatistics = () => {
  const { data: stats, isLoading } = useGlobalStatistics();

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Statistiques Globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Statistiques Globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="w-4 h-4" />
                <p className="text-sm">Tirages Total</p>
              </div>
              <p className="text-3xl font-bold text-primary">{stats.totalDraws}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm">Cette Semaine</p>
              </div>
              <p className="text-3xl font-bold text-success">{stats.recentDraws}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <p className="text-sm">Numéros Analysés</p>
              </div>
              <p className="text-3xl font-bold text-accent">{stats.totalNumbers}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <p className="text-sm">Dernière MAJ</p>
              </div>
              <p className="text-sm font-medium text-foreground">
                {stats.lastUpdate
                  ? formatDistanceToNow(new Date(stats.lastUpdate), {
                      addSuffix: true,
                      locale: fr,
                    })
                  : "Non disponible"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.mostFrequentGlobal.length > 0 && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <TrendingUp className="w-5 h-5" />
              Top 5 Numéros les Plus Fréquents (Tous Tirages)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap items-center justify-center md:justify-start">
              {stats.mostFrequentGlobal.map((stat, index) => (
                <div
                  key={stat.number}
                  className="flex flex-col items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-lg hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>
                    <NumberBall number={stat.number} size="lg" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Fréquence</p>
                    <p className="text-lg font-bold text-success">{stat.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
