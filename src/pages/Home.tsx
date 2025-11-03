import { DaySection } from "@/components/DaySection";
import { DRAW_SCHEDULE, DAYS_ORDER } from "@/types/lottery";
import { Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-12 px-4 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold">Loto Bonheur</h1>
          </div>
          <p className="text-white/90 text-lg max-w-2xl">
            Analyse avancée des résultats de loterie avec statistiques et prédictions intelligentes
          </p>
        </div>
      </div>

      {/* Draws Section */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Tous les Tirages
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez un tirage pour voir les résultats, statistiques et prédictions
          </p>
        </div>

        {DAYS_ORDER.map((day) => (
          <DaySection key={day} day={day} draws={DRAW_SCHEDULE[day]} />
        ))}
      </div>
    </div>
  );
};

export default Home;
