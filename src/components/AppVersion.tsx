import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Wifi, WifiOff } from "lucide-react";
import { useOfflineData } from "@/hooks/useOfflineData";

export const AppVersion = () => {
  const { isOnline } = useOfflineData();
  const version = "2.1.0";
  const buildDate = "2024-01-15";

  return (
    <Card className="bg-muted/30 border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              LOTO LUMIÈRE v{version}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  En ligne
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Hors ligne
                </>
              )}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Build: {buildDate} • Côte d'Ivoire
        </p>
      </CardContent>
    </Card>
  );
};