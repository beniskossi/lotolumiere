import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, TrendingUp } from "lucide-react";
import { Footer } from "@/components/Footer";
import { NumberConsult } from "@/components/NumberConsult";
import { NumberRegularityChart } from "@/components/NumberRegularityChart";
import { DRAW_SCHEDULE } from "@/types/lottery";
import { UserNav } from "@/components/UserNav";

const Consult = () => {
  const navigate = useNavigate();
  const allDraws = Object.values(DRAW_SCHEDULE).flat();
  const [selectedDraw, setSelectedDraw] = useState(allDraws[0].name);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-primary text-white py-6 sm:py-8 px-3 sm:px-4 shadow-lg safe-area-top">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 touch-target"
              onClick={() => navigate("/")}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Retour à l'accueil</span>
            </Button>
            <UserNav />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Search className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Consulter un Numéro</h1>
          </div>
          <p className="text-white/80 mt-2 text-sm sm:text-base">
            Analyse détaillée, probabilités et graphiques de régularité
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        <Card className="bg-gradient-card border-border/50 animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Sélectionner un Tirage
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choisissez le tirage pour analyser les numéros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDraw} onValueChange={setSelectedDraw}>
              <SelectTrigger className="w-full sm:max-w-md touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh] overflow-y-auto">
                {allDraws.map((draw) => (
                  <SelectItem key={draw.name} value={draw.name}>
                    {draw.name} - {draw.day} {draw.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="space-y-6 sm:space-y-8 animate-slide-up">
          <NumberConsult drawName={selectedDraw} />
          <NumberRegularityChart drawName={selectedDraw} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Consult;