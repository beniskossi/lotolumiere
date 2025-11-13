import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Award, Loader2 } from "lucide-react";
import { DRAW_SCHEDULE, DAYS_ORDER } from "@/types/lottery";

interface AlgorithmEvaluation {
  algorithm: string;
  accuracy: number;
  avgMatches: number;
  bestMatch: number;
  worstMatch: number;
  consistency: number;
  totalTests: number;
}

export const AlgorithmEvaluationPanel = () => {
  const { toast } = useToast();
  const [selectedDraw, setSelectedDraw] = useState("Midi");
  const [evaluations, setEvaluations] = useState<AlgorithmEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const allDraws = DAYS_ORDER.flatMap(day => DRAW_SCHEDULE[day]);

  const handleEvaluate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-algorithms", {
        body: { drawName: selectedDraw },
      });

      if (error) throw error;

      setEvaluations(data.evaluations);
      toast({
        title: "✓ Évaluation terminée",
        description: `${data.evaluations.length} algorithmes évalués`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'évaluer les algorithmes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Évaluation des Algorithmes
        </CardTitle>
        <CardDescription>
          Backtesting sur données historiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedDraw} onValueChange={setSelectedDraw}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allDraws.map(draw => (
                <SelectItem key={draw.name} value={draw.name}>
                  {draw.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleEvaluate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Évaluation...
              </>
            ) : (
              "Évaluer"
            )}
          </Button>
        </div>

        {evaluations.length > 0 && (
          <div className="space-y-3">
            {evaluations.map((evaluation, idx) => (
              <div
                key={evaluation.algorithm}
                className={`p-4 rounded-lg border ${
                  idx === 0 ? "bg-primary/10 border-primary/50" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {idx === 0 && <Award className="w-5 h-5 text-primary" />}
                    <h4 className="font-semibold">{evaluation.algorithm}</h4>
                  </div>
                  <Badge variant={idx === 0 ? "default" : "secondary"}>
                    #{idx + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Précision</p>
                    <p className="font-bold text-primary">
                      {evaluation.accuracy.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moy. matchs</p>
                    <p className="font-bold">{evaluation.avgMatches.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Meilleur</p>
                    <p className="font-bold text-green-600">{evaluation.bestMatch}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Consistance</p>
                    <p className="font-bold">±{evaluation.consistency.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {evaluation.totalTests} tests effectués
                </p>
              </div>
            ))}
          </div>
        )}

        {evaluations.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Sélectionnez un tirage et lancez l'évaluation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
