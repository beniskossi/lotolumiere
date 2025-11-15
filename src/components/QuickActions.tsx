import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, TrendingUp, History, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const QuickActions = () => {
  const { user } = useAuth();

  const actions = [
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Prédiction Rapide",
      description: "Générer une prédiction pour le prochain tirage",
      href: "/consulter",
      color: "bg-primary"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Statistiques",
      description: "Voir les analyses détaillées",
      href: "/statistiques", 
      color: "bg-success"
    },
    {
      icon: <History className="w-4 h-4" />,
      label: "Historique",
      description: "Consulter les résultats passés",
      href: "/historique",
      color: "bg-accent"
    }
  ];

  if (user) {
    actions.push({
      icon: <Star className="w-4 h-4" />,
      label: "Dashboard",
      description: "Mon espace personnel",
      href: "/dashboard",
      color: "bg-destructive"
    });
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              asChild
              className="h-auto p-3 flex-col gap-2 hover:bg-muted/50"
            >
              <Link to={action.href}>
                <div className={`w-10 h-10 rounded-full ${action.color} text-white flex items-center justify-center`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium text-xs">{action.label}</p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {action.description}
                  </p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};