import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Zap, RefreshCw, TrendingUp, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  icon: any;
  action: string;
}

const AVAILABLE_JOBS: ScheduledJob[] = [
  {
    id: "auto-scrape",
    name: "Scraping Automatique",
    description: "Récupère automatiquement les nouveaux résultats des tirages",
    schedule: "Tous les jours à 22h00",
    enabled: false,
    icon: Database,
    action: "scrape-results",
  },
  {
    id: "auto-train",
    name: "Entraînement Quotidien",
    description: "Entraîne les algorithmes avec les nouvelles données",
    schedule: "Tous les jours à 23h00",
    enabled: false,
    icon: TrendingUp,
    action: "train-algorithms",
  },
  {
    id: "auto-evaluate",
    name: "Évaluation Auto",
    description: "Évalue automatiquement les prédictions contre les résultats",
    schedule: "Tous les jours à 22h30",
    enabled: false,
    icon: Zap,
    action: "evaluate-predictions",
  },
  {
    id: "auto-cleanup",
    name: "Nettoyage Mensuel",
    description: "Nettoie les anciennes données (>6 mois)",
    schedule: "Le 1er de chaque mois à 02h00",
    enabled: false,
    icon: RefreshCw,
    action: "cleanup-old-data",
  },
];

export const AutomationScheduler = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(AVAILABLE_JOBS);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleToggleJob = async (jobId: string) => {
    setIsConfiguring(true);
    
    // Simuler une mise à jour (à remplacer par un vrai appel API)
    setTimeout(() => {
      setJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, enabled: !job.enabled }
            : job
        )
      );

      const job = jobs.find(j => j.id === jobId);
      toast({
        title: job?.enabled ? "Tâche désactivée" : "Tâche activée",
        description: `${job?.name} ${job?.enabled ? 'ne sera plus exécutée' : 'sera exécutée'} selon le planning`,
      });

      setIsConfiguring(false);
    }, 1000);
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Planification Automatique
        </CardTitle>
        <CardDescription>
          Configurez les tâches automatiques pour maintenir votre système à jour
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Les tâches planifiées s'exécutent automatiquement selon le calendrier défini. 
            Assurez-vous d'avoir configuré pg_cron dans votre base de données.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {jobs.map((job) => {
            const Icon = job.icon;
            return (
              <div 
                key={job.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  job.enabled 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-secondary/20 border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      job.enabled ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        job.enabled ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge 
                          variant={job.enabled ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {job.enabled ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{job.schedule}</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={job.enabled}
                    onCheckedChange={() => handleToggleJob(job.id)}
                    disabled={isConfiguring}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Alert className="bg-secondary/20">
          <AlertDescription className="text-xs">
            💡 <strong>Configuration avancée :</strong> Les tâches cron utilisent pg_cron de PostgreSQL. 
            Pour modifier les horaires, contactez votre administrateur système ou consultez la documentation.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              toast({
                title: "Statut des tâches",
                description: `${jobs.filter(j => j.enabled).length} tâche(s) active(s) sur ${jobs.length}`,
              });
            }}
          >
            Vérifier le statut
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => {
              toast({
                title: "Logs disponibles",
                description: "Consultez les logs dans l'onglet Admin pour voir l'historique d'exécution",
              });
            }}
          >
            Voir les logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
