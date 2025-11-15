import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  HelpCircle, 
  Zap, 
  Smartphone, 
  Database, 
  Wifi, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink
} from "lucide-react";

export const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const commonIssues = [
    {
      title: "L'application ne se charge pas",
      icon: <RefreshCw className="w-4 h-4" />,
      severity: "high",
      solutions: [
        "Vérifiez votre connexion internet",
        "Videz le cache du navigateur (Ctrl+Shift+Delete)",
        "Désactivez temporairement les bloqueurs de publicité",
        "Essayez en mode navigation privée"
      ]
    },
    {
      title: "Statistiques vides ou manquantes",
      icon: <Database className="w-4 h-4" />,
      severity: "medium",
      solutions: [
        "Sélectionnez un tirage avec des données (ex: Etoile, Fortune)",
        "Actualisez la page avec F5",
        "Vérifiez que vous êtes connecté à internet",
        "Essayez un autre tirage populaire"
      ]
    },
    {
      title: "Problèmes sur mobile",
      icon: <Smartphone className="w-4 h-4" />,
      severity: "low",
      solutions: [
        "L'interface s'adapte automatiquement aux mobiles",
        "Fermez les autres applications pour libérer la mémoire",
        "Utilisez Chrome ou Safari pour une meilleure compatibilité",
        "Activez JavaScript dans votre navigateur"
      ]
    },
    {
      title: "Connexion impossible",
      icon: <Wifi className="w-4 h-4" />,
      severity: "high",
      solutions: [
        "Vérifiez vos identifiants (email/mot de passe)",
        "Autorisez les cookies pour ce site",
        "Réinitialisez votre mot de passe si nécessaire",
        "Contactez un administrateur si le problème persiste"
      ]
    }
  ];

  const quickFixes = [
    {
      title: "Actualiser les données",
      description: "Recharge les dernières informations",
      action: () => window.location.reload(),
      icon: <RefreshCw className="w-4 h-4" />
    },
    {
      title: "Vider le cache",
      description: "Résout la plupart des problèmes d'affichage",
      action: () => {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      },
      icon: <Zap className="w-4 h-4" />
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-3 h-3" />;
      case 'medium': return <AlertTriangle className="w-3 h-3" />;
      case 'low': return <CheckCircle className="w-3 h-3" />;
      default: return <HelpCircle className="w-3 h-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Aide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Centre d'Aide - LOTO LUMIÈRE
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues">Problèmes</TabsTrigger>
            <TabsTrigger value="fixes">Solutions Rapides</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues" className="space-y-4">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                Sélectionnez le problème qui correspond le mieux à votre situation
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {commonIssues.map((issue, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {issue.icon}
                        {issue.title}
                      </div>
                      <Badge variant={getSeverityColor(issue.severity) as any} className="gap-1">
                        {getSeverityIcon(issue.severity)}
                        {issue.severity === 'high' ? 'Urgent' : 
                         issue.severity === 'medium' ? 'Modéré' : 'Mineur'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Solutions :</p>
                      <ul className="space-y-1">
                        {issue.solutions.map((solution, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="fixes" className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Actions rapides pour résoudre les problèmes courants
              </AlertDescription>
            </Alert>

            <div className="grid gap-3">
              {quickFixes.map((fix, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {fix.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{fix.title}</p>
                          <p className="text-xs text-muted-foreground">{fix.description}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={fix.action}
                        className="gap-2"
                      >
                        Exécuter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <p className="font-medium text-sm text-blue-800 dark:text-blue-200">
                    Diagnostic Avancé
                  </p>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Pour un diagnostic complet de l'application
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/admin';
                  }}
                  className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <ExternalLink className="w-3 h-3" />
                  Ouvrir le Diagnostic
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                Besoin d'aide supplémentaire ? Voici comment nous contacter
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Feedback Intégré</CardTitle>
                  <CardDescription className="text-xs">
                    Signalez un problème directement depuis l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Utilisez le bouton "Feedback" disponible sur la page d'accueil pour signaler des bugs ou suggérer des améliorations.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/';
                    }}
                  >
                    Aller au Feedback
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informations Système</CardTitle>
                  <CardDescription className="text-xs">
                    Informations utiles pour le support technique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs font-mono bg-muted p-3 rounded">
                    <div><strong>Navigateur:</strong> {navigator.userAgent}</div>
                    <div><strong>Résolution:</strong> {window.innerWidth}×{window.innerHeight}</div>
                    <div><strong>Langue:</strong> {navigator.language}</div>
                    <div><strong>En ligne:</strong> {navigator.onLine ? 'Oui' : 'Non'}</div>
                    <div><strong>Cookies:</strong> {navigator.cookieEnabled ? 'Activés' : 'Désactivés'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    <strong>💡 Conseil :</strong> Avant de contacter le support
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <li>• Essayez d'actualiser la page (F5)</li>
                    <li>• Vérifiez votre connexion internet</li>
                    <li>• Testez en mode navigation privée</li>
                    <li>• Consultez les solutions rapides ci-dessus</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};