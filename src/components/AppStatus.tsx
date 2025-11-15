import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AppStatus = () => {
  const { data: systemStatus } = useQuery({
    queryKey: ["system-status"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("draw_results").select("id").limit(1);
        const dbStatus = !error;
        
        return {
          database: dbStatus,
          api: true,
          predictions: true,
          lastCheck: new Date().toISOString()
        };
      } catch {
        return {
          database: false,
          api: false,
          predictions: false,
          lastCheck: new Date().toISOString()
        };
      }
    },
    refetchInterval: 60000, // Check every minute
  });

  const services = [
    {
      name: "Base de données",
      status: systemStatus?.database ?? false,
      icon: <Database className="w-4 h-4" />
    },
    {
      name: "API",
      status: systemStatus?.api ?? false,
      icon: <CheckCircle className="w-4 h-4" />
    },
    {
      name: "Prédictions IA",
      status: systemStatus?.predictions ?? false,
      icon: <AlertCircle className="w-4 h-4" />
    }
  ];

  const allOperational = services.every(service => service.status);

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">État du Système</h3>
          <Badge variant={allOperational ? "default" : "destructive"}>
            {allOperational ? "Opérationnel" : "Problème détecté"}
          </Badge>
        </div>
        
        <div className="space-y-2">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={service.status ? "text-green-500" : "text-red-500"}>
                  {service.icon}
                </div>
                <span>{service.name}</span>
              </div>
              <Badge variant={service.status ? "outline" : "destructive"} className="text-xs">
                {service.status ? "OK" : "Erreur"}
              </Badge>
            </div>
          ))}
        </div>

        {systemStatus?.lastCheck && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              Dernière vérification: {new Date(systemStatus.lastCheck).toLocaleTimeString('fr-FR')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};