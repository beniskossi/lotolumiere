import { DaySection } from "@/components/DaySection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallButton } from "@/components/InstallButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Footer } from "@/components/Footer";
import { GlobalStatistics } from "@/components/GlobalStatistics";
import { AlgorithmRankings } from "@/components/AlgorithmRankings";
import { BestAlgorithmDisplay } from "@/components/BestAlgorithmDisplay";
import { DRAW_SCHEDULE, DAYS_ORDER } from "@/types/lottery";
import { Sparkles, TrendingUp, BarChart3, Database, History as HistoryIcon, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserNav } from "@/components/UserNav";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-8 sm:py-16 px-4 mb-6 sm:mb-8 shadow-lg relative overflow-hidden safe-area-top">
        <div className="absolute inset-0 bg-gradient-accent opacity-10"></div>
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2 z-20">
          <InstallButton />
          <ThemeToggle />
          {user && <UserNav />}
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-glow flex-shrink-0">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">LOTO LUMIERE</h1>
              <p className="text-white/80 text-xs sm:text-sm">Côte d'Ivoire</p>
            </div>
          </div>
          <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed">
            Analyse avancée des résultats de loterie avec statistiques en temps réel, 
            prédictions intelligentes et visualisations interactives
          </p>

          {/* Features Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all touch-target">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <Database className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">28 Tirages</p>
                  <p className="text-xs text-white/70">Tous les jours</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all touch-target">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">Statistiques</p>
                  <p className="text-xs text-white/70">Analyses détaillées</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all touch-target">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">Prédictions ML</p>
                  <p className="text-xs text-white/70">IA avancée</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Draws Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
        {/* Navigation Links */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-in flex-wrap">
          <Button
            variant="outline"
            asChild
            className="gap-2 flex-1 sm:flex-initial touch-target"
            size="sm"
          >
            <Link to="/statistiques">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden xs:inline">Statistiques</span>
              <span className="xs:hidden">Stats</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="gap-2 flex-1 sm:flex-initial touch-target"
            size="sm"
          >
            <Link to="/consulter">
              <Sparkles className="w-4 h-4" />
              <span className="hidden xs:inline">Consulter</span>
              <span className="xs:hidden">Cons.</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="gap-2 flex-1 sm:flex-initial touch-target"
            size="sm"
          >
            <Link to="/historique">
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden xs:inline">Historique</span>
              <span className="xs:hidden">Hist.</span>
            </Link>
          </Button>
          {user && (
            <Button
              variant="default"
              asChild
              className="gap-2 flex-1 sm:flex-initial touch-target"
              size="sm"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden xs:inline">Dashboard</span>
                <span className="xs:hidden">Board</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Global Statistics */}
        <div className="mb-8 sm:mb-12 animate-slide-up">
          <GlobalStatistics />
        </div>

        {/* Algorithm Rankings */}
        <div className="mb-8 sm:mb-12 animate-slide-up">
          <AlgorithmRankings />
        </div>

        {/* Best Algorithm Recommendation */}
        <div className="mb-8 sm:mb-12 animate-slide-up">
          <BestAlgorithmDisplay drawName={DRAW_SCHEDULE[DAYS_ORDER[0]][0].name} />
        </div>

        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
            Tous les Tirages
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Sélectionnez un tirage pour accéder aux résultats, statistiques détaillées et prédictions IA
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {DAYS_ORDER.map((day, index) => (
            <div key={day} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <DaySection day={day} draws={DRAW_SCHEDULE[day]} />
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Home;
