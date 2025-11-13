import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  accuracy: number;
  predictions: number;
  points: number;
  trend: "up" | "down" | "stable";
}

export const GlobalLeaderboard = () => {
  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: "1",
      username: "PredictorPro",
      level: 42,
      accuracy: 78.5,
      predictions: 1250,
      points: 15420,
      trend: "up"
    },
    {
      rank: 2,
      userId: "2",
      username: "LuckyNumbers",
      level: 38,
      accuracy: 76.2,
      predictions: 980,
      points: 14100,
      trend: "stable"
    },
    {
      rank: 3,
      userId: "3",
      username: "AlgoMaster",
      level: 35,
      accuracy: 75.8,
      predictions: 850,
      points: 12800,
      trend: "up"
    },
    {
      rank: 4,
      userId: "4",
      username: "DataWizard",
      level: 32,
      accuracy: 74.1,
      predictions: 720,
      points: 11200,
      trend: "down"
    },
    {
      rank: 5,
      userId: "5",
      username: "StatGenius",
      level: 30,
      accuracy: 73.5,
      predictions: 650,
      points: 10500,
      trend: "stable"
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <span className="text-muted-foreground">→</span>;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Classement Global
        </CardTitle>
        <CardDescription>
          Top 100 des meilleurs prédicteurs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className={`p-4 rounded-lg border transition-all hover:shadow-md ${
              entry.rank <= 3
                ? "bg-primary/5 border-primary/30"
                : "bg-muted/30 border-border/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-12">
                {getRankIcon(entry.rank)}
                <span className="font-bold text-lg">#{entry.rank}</span>
              </div>

              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {entry.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{entry.username}</h4>
                  <Badge variant="secondary" className="text-xs">
                    Niv. {entry.level}
                  </Badge>
                  {getTrendIcon(entry.trend)}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Précision: {entry.accuracy}%</span>
                  <span>•</span>
                  <span>{entry.predictions} prédictions</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border/50">
          <div className="p-3 bg-accent/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-muted-foreground">#42</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    ME
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Vous</p>
                  <p className="text-xs text-muted-foreground">Niv. 12</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">2,450</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
