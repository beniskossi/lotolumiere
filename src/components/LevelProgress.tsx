import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, TrendingUp } from "lucide-react";

interface LevelProgressProps {
  currentLevel?: number;
  currentXP?: number;
  xpToNextLevel?: number;
}

export const LevelProgress = ({ 
  currentLevel = 12, 
  currentXP = 2450, 
  xpToNextLevel = 3000 
}: LevelProgressProps) => {
  const progressPercentage = (currentXP / xpToNextLevel) * 100;
  const xpNeeded = xpToNextLevel - currentXP;

  const getLevelTier = (level: number) => {
    if (level >= 50) return { name: "Légendaire", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    if (level >= 30) return { name: "Expert", color: "text-purple-500", bg: "bg-purple-500/10" };
    if (level >= 15) return { name: "Avancé", color: "text-blue-500", bg: "bg-blue-500/10" };
    return { name: "Débutant", color: "text-green-500", bg: "bg-green-500/10" };
  };

  const tier = getLevelTier(currentLevel);

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              Niveau & Progression
            </CardTitle>
            <CardDescription>
              Gagnez de l'XP en utilisant l'application
            </CardDescription>
          </div>
          <div className={`px-4 py-2 rounded-lg ${tier.bg}`}>
            <p className={`text-2xl font-bold ${tier.color}`}>
              Niv. {currentLevel}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`p-4 rounded-lg ${tier.bg} border border-current/20`}>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className={`${tier.color} border-current`}>
              {tier.name}
            </Badge>
            <span className={`text-sm font-medium ${tier.color}`}>
              {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Encore {xpNeeded.toLocaleString()} XP pour le niveau {currentLevel + 1}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">XP Quotidien</span>
            </div>
            <p className="text-2xl font-bold">+450</p>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Série</span>
            </div>
            <p className="text-2xl font-bold">7 jours</p>
            <p className="text-xs text-muted-foreground">Connexion</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Comment gagner de l'XP</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <span>Faire une prédiction</span>
              <Badge variant="secondary">+50 XP</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <span>Prédiction réussie (3+ numéros)</span>
              <Badge variant="secondary">+200 XP</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <span>Connexion quotidienne</span>
              <Badge variant="secondary">+100 XP</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <span>Débloquer un succès</span>
              <Badge variant="secondary">+500 XP</Badge>
            </div>
          </div>
        </div>

        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium mb-1">🎁 Récompense de niveau</p>
          <p className="text-xs text-muted-foreground">
            Au niveau {currentLevel + 1}, vous débloquerez: Analyse avancée de patterns
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
