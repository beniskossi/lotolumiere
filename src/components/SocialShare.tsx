import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, Download, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  description: string;
  numbers?: number[];
  drawName?: string;
  url?: string;
}

export const SocialShare = ({ 
  title, 
  description, 
  numbers = [], 
  drawName = "", 
  url = window.location.href 
}: SocialShareProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareText = `${title}\n${description}\n${numbers.length > 0 ? `Numéros: ${numbers.join(', ')}` : ''}\n${drawName ? `Tirage: ${drawName}` : ''}\n\n#LotoLumiere #Prediction`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      toast.error("Le partage natif n'est pas supporté sur ce navigateur");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papiers!");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    toast.success("Texte copié dans le presse-papiers!");
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'loto-lumiere-qr.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Partage natif */}
          {navigator.share && (
            <Button onClick={handleNativeShare} className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
          )}

          {/* Réseaux sociaux */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={handleWhatsAppShare}
              className="gap-2 bg-green-50 hover:bg-green-100 border-green-200"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTelegramShare}
              className="gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              <Send className="w-4 h-4 text-blue-600" />
              Telegram
            </Button>
          </div>

          {/* Copier */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input value={url} readOnly className="flex-1" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={handleCopyText} className="w-full gap-2">
              <Copy className="w-4 h-4" />
              Copier le texte
            </Button>
          </div>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">QR Code</CardTitle>
              <CardDescription className="text-xs">
                Scannez pour partager rapidement
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-2">
              <QRCodeSVG 
                id="qr-code"
                value={url} 
                size={120}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
              <Button variant="outline" size="sm" onClick={downloadQRCode} className="gap-2">
                <Download className="w-3 h-3" />
                Télécharger
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};