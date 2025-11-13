import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";
import { AlertTriangle, Shield, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnomalyDetectionPanelProps {
  drawName: string;
}

export const AnomalyDetectionPanel = ({ drawName }: AnomalyDetectionPanelProps) => {
  const { data: anomalies, isLoading } = useAnomalyDetection(drawName);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Détection d'Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            ✓ Aucune anomalie détectée - Distribution normale
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Détection d'Anomalies
        </CardTitle>
        <CardDescription>
          {anomalies.length} anomalie(s) détectée(s) dans les données
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {anomalies.map((anomaly, idx) => (
          <Alert key={idx} variant={anomaly.severity === "high" ? "destructive" : "default"}>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{anomaly.description}</p>
                  {anomaly.drawDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Date: {new Date(anomaly.drawDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {anomaly.numbers && anomaly.numbers.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {anomaly.numbers.map(num => (
                        <div key={num} className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                          {num}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant={anomaly.severity === "high" ? "destructive" : anomaly.severity === "medium" ? "default" : "secondary"}>
                  {anomaly.severity === "high" ? "Élevé" : anomaly.severity === "medium" ? "Moyen" : "Faible"}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
