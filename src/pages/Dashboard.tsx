import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserFavoriteNumbers } from "@/components/UserFavoriteNumbers";
import { TrackedPredictionsDisplay } from "@/components/TrackedPredictionsDisplay";
import { PredictionComparison } from "@/components/PredictionComparison";
import { PersonalizationSettings } from "@/components/PersonalizationSettings";
import { Onboarding } from "@/components/Onboarding";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { ArrowLeft, LayoutDashboard, TrendingUp } from "lucide-react";
import { Footer } from "@/components/Footer";
import { UserNav } from "@/components/UserNav";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: preferences, isLoading: prefsLoading } = useUserPreferences(user?.id);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (preferences && !preferences.has_completed_onboarding) {
      setShowOnboarding(true);
    }
  }, [preferences]);

  if (loading || prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <LayoutDashboard className="w-8 h-8" />
                Mon Dashboard
              </h1>
              <p className="text-muted-foreground">
                Gérez vos favoris et suivez vos prédictions
              </p>
            </div>
          </div>
          <UserNav />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {preferences?.preferred_draw_name || "Midi"}
              </div>
              <p className="text-sm text-muted-foreground">Tirage préféré</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {preferences?.notification_enabled ? "✓" : "✗"}
              </div>
              <p className="text-sm text-muted-foreground">
                {preferences?.notification_enabled ? "Activées" : "Désactivées"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <p className="text-sm text-muted-foreground">Analyses actives</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="favorites">Mes Favoris</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites" className="space-y-4">
            <UserFavoriteNumbers />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <TrackedPredictionsDisplay />
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comparaison de Prédictions</CardTitle>
                <CardDescription>
                  Comparez les prédictions avec les résultats réels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionComparison drawName="Midi" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personnalisation</CardTitle>
                <CardDescription>
                  Personnalisez votre expérience LOTO LUMIERE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalizationSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      <Onboarding 
        open={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />
    </div>
  );
}