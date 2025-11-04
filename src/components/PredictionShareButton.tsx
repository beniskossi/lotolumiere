import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PredictionShareButtonProps {
  predictionId: string;
  drawName: string;
  numbers: number[];
  confidence?: number;
}

export const PredictionShareButton = ({ 
  predictionId, 
  drawName, 
  numbers, 
  confidence 
}: PredictionShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const shareUrl = `${window.location.origin}/tirage/${encodeURIComponent(drawName)}`;
  const shareText = `🎲 Prédiction LOTO LUMIERE pour ${drawName}:\n${numbers.join(" - ")}${confidence ? ` (${(confidence * 100).toFixed(1)}% confiance)` : ""}\n\nDécouvrez l'app: ${shareUrl}`;

  const trackShare = async (platform: string) => {
    if (!user) return;
    
    try {
      await supabase.from("prediction_shares").insert({
        user_id: user.id,
        prediction_id: predictionId,
        share_platform: platform,
      });
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Copié dans le presse-papier");
      trackShare("clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
    trackShare("facebook");
    setOpen(false);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
    trackShare("twitter");
    setOpen(false);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    trackShare("whatsapp");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager la prédiction</DialogTitle>
          <DialogDescription>
            Partagez cette prédiction sur vos réseaux sociaux
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">{drawName}</p>
            <div className="flex gap-2 flex-wrap">
              {numbers.map((num, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold"
                >
                  {num}
                </div>
              ))}
            </div>
            {confidence && (
              <p className="text-xs text-muted-foreground mt-2">
                Confiance: {(confidence * 100).toFixed(1)}%
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleShareFacebook}
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleShareTwitter}
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};