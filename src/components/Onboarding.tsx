import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, Heart, Bell } from "lucide-react";
import { useUpdatePreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: "Bienvenue sur Loto Lumière",
    description: "Découvrez comment notre application peut vous aider à mieux jouer au loto.",
  },
  {
    icon: TrendingUp,
    title: "Analyses Prédictives IA",
    description: "Notre IA analyse les tirages passés pour vous proposer des prédictions intelligentes basées sur plusieurs algorithmes avancés.",
  },
  {
    icon: Heart,
    title: "Sauvegardez vos Favoris",
    description: "Créez et sauvegardez vos combinaisons favorites pour les retrouver facilement.",
  },
  {
    icon: Bell,
    title: "Dashboard Personnel",
    description: "Suivez vos prédictions, comparez vos résultats et consultez vos statistiques personnelles.",
  },
];

export const Onboarding = ({ open, onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const updatePreferences = useUpdatePreferences();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (user) {
      await updatePreferences.mutateAsync({
        userId: user.id,
        preferences: { has_completed_onboarding: true },
      });
    }
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Icon className="w-8 h-8 text-primary" />
              </div>
            </div>
            {currentStepData.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Progress value={progress} className="w-full" />
          
          <p className="text-center text-muted-foreground">
            {currentStepData.description}
          </p>

          <div className="flex gap-2 justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
            >
              Passer
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? "Suivant" : "Commencer"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};