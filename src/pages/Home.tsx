import { DaySection } from "@/components/DaySection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallButton } from "@/components/InstallButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Footer } from "@/components/Footer";
import { DRAW_SCHEDULE, DAYS_ORDER } from "@/types/lottery";
import { Sparkles, TrendingUp, BarChart3, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-16 px-4 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-accent opacity-10"></div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-glow">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">Loto Bonheur</h1>
              <p className="text-white/80 text-sm">Côte d'Ivoire</p>
            </div>
          </div>
          <p className="text-white/90 text-xl max-w-3xl leading-relaxed">
            Analyse avancée des résultats de loterie avec statistiques en temps réel, 
            prédictions intelligentes et visualisations interactives
          </p>

          {/* Features Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <Database className="w-8 h-8 text-white" />
                <div>
                  <p className="font-semibold text-white">28 Tirages</p>
                  <p className="text-xs text-white/70">Tous les jours</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-white" />
                <div>
                  <p className="font-semibold text-white">Statistiques</p>
                  <p className="text-xs text-white/70">Analyses détaillées</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-white" />
                <div>
                  <p className="font-semibold text-white">Prédictions ML</p>
                  <p className="text-xs text-white/70">IA avancée</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Draws Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Tous les Tirages
          </h2>
          <p className="text-muted-foreground text-lg">
            Sélectionnez un tirage pour accéder aux résultats, statistiques détaillées et prédictions IA
          </p>
        </div>

        {DAYS_ORDER.map((day) => (
          <DaySection key={day} day={day} draws={DRAW_SCHEDULE[day]} />
        ))}
      </div>

      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Home;
