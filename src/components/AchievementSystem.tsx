import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, Target, Zap, TrendingUp } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const AchievementSystem = () => {
  const achievements: Achievement[] = [
    {
      id: "first_prediction",
      title: "Premier Pas",
      description: "Faire votre première prédiction",
      icon: <Star className="w-6 h-6" />,
      progress: 1,
      total: 1,
      unlocked: true,
      rarity: "common"
    },
    {
      id: "prediction_master",
      title: "Maître Prédicteur",
      description: "Faire 100 prédictions",
      icon: <Trophy className="w-6 h-6" />,
      progress: 45,
      total: 100,
      unlocked: false,
      rarity: "rare"
    },
    {
      id: "accuracy_expert",
      title: "Expert en Précision",
      description: "Atteindre 70% de précision",
      icon: <Target className="w-6 h-6" />,
      progress: 65,
      total: 70,
      unlocked: false,
      rarity: "epic"
    },
    {
      id: "perfect_prediction",
      title: "Prédiction Parfaite",
      description: "Prédire les 5 numéros corrects",
      icon: <Zap className="w-6 h-6" />,
      progress: 0,
      total: 1,
      unlocked: false,
      rarity: "legendary"
    },
    {
      id: "streak_master",
      title: "Série Gagnante",
      description: "10 prédictions réussies d'affilée",
      icon: <TrendingUp className="w-6 h-6" />,
      progress: 3,
      total: 10,
      unlocked: false,
      rarity: "epic"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case "common": return "Commun";
      case "rare": return "Rare";
      case "epic": return "Épique";
      case "legendary": return "Légendaire";
      default: return "Commun";
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Succès & Réalisations
            </CardTitle>
            <CardDescription>
              Débloquez des badges en utilisant l'application
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {unlockedCount}/{totalCount}
            </p>
            <p className="text-xs text-muted-foreground">Débloqués</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
          <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />
        </div>

        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.unlocked
                  ? "bg-primary/10 border-primary/50"
                  : "bg-muted/30 border-border/50 opacity-75"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-full ${
                    achievement.unlocked
                      ? getRarityColor(achievement.rarity)
                      : "bg-muted"
                  } text-white`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getRarityColor(achievement.rarity)} text-white border-0`}
                    >
                      {getRarityText(achievement.rarity)}
                    </Badge>
                  </div>
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progression</span>
                        <span>
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                      <Progress
                        value={(achievement.progress / achievement.total) * 100}
                        className="h-1"
                      />
                    </div>
                  )}
                  {achievement.unlocked && (
                    <Badge variant="default" className="mt-2">
                      ✓ Débloqué
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
