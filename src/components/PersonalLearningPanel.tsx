import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePersonalLearning } from "@/hooks/usePersonalLearning";
import { useAuth } from "@/hooks/useAuth";
import { Brain, TrendingUp, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const PersonalLearningPanel = () => {
  const { user } = useAuth();
  const { model } = usePersonalLearning(user?.id);

  if (!user) return null;

  if (!model) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" />
          Modèle Personnel IA
        </CardTitle>
        <CardDescription>
          Apprentissage automatique basé sur vos choix et résultats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Score d'apprentissage</span>
            </div>
            <p className="text-2xl font-bold">{model.learningScore.toFixed(1)}%</p>
            <Progress value={model.learningScore} className="h-1 mt-2" />
          </div>

          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Confiance adaptée</span>
            </div>
            <p className="text-2xl font-bold">{model.confidence.toFixed(1)}%</p>
            <Progress value={model.confidence} className="h-1 mt-2" />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Numéros adaptés à votre profil</p>
          <div className="flex gap-2 flex-wrap">
            {model.adaptedNumbers.map(num => (
              <div key={num} className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                {num}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Top préférences</p>
          <div className="space-y-2">
            {model.preferences.slice(0, 5).map(pref => (
              <div key={pref.number} className="flex items-center justify-between text-sm p-2 bg-background/30 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                    {pref.number}
                  </div>
                  <span>Utilisé {pref.weight}×</span>
                </div>
                <Badge variant={pref.successRate > 30 ? "default" : "secondary"}>
                  {pref.successRate.toFixed(0)}% succès
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Le modèle s'améliore automatiquement avec chaque prédiction
        </p>
      </CardContent>
    </Card>
  );
};
