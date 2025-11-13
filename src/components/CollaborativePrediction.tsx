import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NumberBall } from "./NumberBall";
import { Users, Plus, TrendingUp, Vote, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CollaborativePredictionProps {
  drawName: string;
}

interface CommunityPrediction {
  numbers: number[];
  votes: number;
  confidence: number;
  contributors: number;
  isUserVoted: boolean;
}

export const CollaborativePrediction = ({ drawName }: CollaborativePredictionProps) => {
  const { user } = useAuth();
  const [userNumbers, setUserNumbers] = useState<number[]>([]);
  const [numberInput, setNumberInput] = useState("");
  
  // Données simulées - à remplacer par de vraies données
  const [communityPredictions] = useState<CommunityPrediction[]>([
    {
      numbers: [7, 14, 21, 35, 42],
      votes: 156,
      confidence: 78,
      contributors: 89,
      isUserVoted: false
    },
    {
      numbers: [3, 18, 27, 44, 67],
      votes: 134,
      confidence: 72,
      contributors: 76,
      isUserVoted: true
    },
    {
      numbers: [12, 25, 33, 58, 81],
      votes: 98,
      confidence: 65,
      contributors: 54,
      isUserVoted: false
    }
  ]);

  const addNumber = () => {
    const num = parseInt(numberInput);
    if (num >= 1 && num <= 90 && !userNumbers.includes(num) && userNumbers.length < 5) {
      setUserNumbers([...userNumbers, num].sort((a, b) => a - b));
      setNumberInput("");
    }
  };

  const removeNumber = (num: number) => {
    setUserNumbers(userNumbers.filter(n => n !== num));
  };

  const submitPrediction = () => {
    if (userNumbers.length === 5) {
      toast.success("Prédiction ajoutée à la communauté!");
      setUserNumbers([]);
    }
  };

  const voteForPrediction = (index: number) => {
    toast.success("Vote enregistré!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Prédictions Collaboratives
          </CardTitle>
          <CardDescription>
            Participez aux prédictions communautaires et votez pour les meilleures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulaire de soumission */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Proposer une prédiction</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="Numéro (1-90)"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addNumber()}
                />
                <Button onClick={addNumber} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {userNumbers.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {userNumbers.map(num => (
                    <div key={num} className="relative group">
                      <NumberBall number={num} size="sm" />
                      <button
                        onClick={() => removeNumber(num)}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-4 h-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={submitPrediction}
                disabled={userNumbers.length !== 5 || !user}
                className="w-full"
              >
                Soumettre ma prédiction ({userNumbers.length}/5)
              </Button>
            </div>
          </div>

          {/* Prédictions de la communauté */}
          <div className="space-y-4">
            <h4 className="font-medium">Prédictions populaires</h4>
            {communityPredictions.map((pred, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {pred.contributors} contributeurs
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{pred.votes} votes</p>
                      <p className="text-xs text-muted-foreground">
                        {pred.confidence}% confiance
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    {pred.numbers.map(num => (
                      <NumberBall key={num} number={num} size="md" />
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Niveau de confiance</span>
                      <span>{pred.confidence}%</span>
                    </div>
                    <Progress value={pred.confidence} className="h-1" />
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant={pred.isUserVoted ? "default" : "outline"}
                      size="sm"
                      onClick={() => voteForPrediction(index)}
                      disabled={!user}
                      className="gap-1"
                    >
                      <Vote className="w-3 h-3" />
                      {pred.isUserVoted ? "Voté" : "Voter"}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Analyser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};