import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trash2, Download, Upload, RefreshCw, LogOut, LogIn } from "lucide-react";
import { useRefreshResults } from "@/hooks/useDrawResults";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DRAW_SCHEDULE } from "@/types/lottery";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const refreshResults = useRefreshResults();
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole(user?.id);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulaire de connexion
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Formulaire d'ajout manuel
  const [drawName, setDrawName] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [numbers, setNumbers] = useState(["", "", "", "", ""]);

  // Récupérer tous les tirages pour le select
  const allDraws = Object.values(DRAW_SCHEDULE).flat();

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  const handleAddResult = async () => {
    if (!drawName || !drawDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const winningNumbers = numbers.map(n => parseInt(n)).filter(n => n >= 1 && n <= 90);
    if (winningNumbers.length !== 5) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer 5 numéros valides entre 1 et 90",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const draw = allDraws.find(d => d.name === drawName);
      const { error } = await supabase.from("draw_results").insert({
        draw_name: drawName,
        draw_day: draw?.day || "",
        draw_time: draw?.time || "",
        draw_date: drawDate,
        winning_numbers: winningNumbers,
      });

      if (error) throw error;

      toast({
        title: "✓ Résultat ajouté",
        description: "Le tirage a été enregistré avec succès",
      });

      // Reset form
      setDrawName("");
      setDrawDate("");
      setNumbers(["", "", "", "", ""]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le résultat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrapeResults = async () => {
    setIsLoading(true);
    try {
      await refreshResults();
      toast({
        title: "✓ Scraping terminé",
        description: "Les résultats ont été mis à jour",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec du scraping",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data, error } = await supabase.from("draw_results").select("*").order("draw_date", { ascending: false });
      
      if (error) throw error;

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `loto-bonheur-export-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      toast({
        title: "✓ Export réussi",
        description: "Les données ont été exportées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'export",
        variant: "destructive",
      });
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("Format JSON invalide");
      }

      // Insérer les données
      const { error } = await supabase.from("draw_results").insert(data);
      if (error) throw error;

      toast({
        title: "✓ Import réussi",
        description: `${data.length} résultat(s) importé(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'import",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteOldResults = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer les résultats de plus de 6 mois ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateStr = sixMonthsAgo.toISOString().split("T")[0];

      const { error } = await supabase
        .from("draw_results")
        .delete()
        .lt("draw_date", dateStr);

      if (error) throw error;

      toast({
        title: "✓ Nettoyage effectué",
        description: "Les anciens résultats ont été supprimés",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      toast({
        title: "✓ Connexion réussie",
        description: "Bienvenue dans l'interface d'administration",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt",
      });
      navigate("/");
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Check if user has admin role
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-primary text-white py-8 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
            <h1 className="text-4xl font-bold">Accès Refusé</h1>
            <p className="text-white/80 mt-2">Vous n'avez pas les permissions nécessaires</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-16">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Accès Administrateur Requis</CardTitle>
              <CardDescription>
                Cette page est réservée aux administrateurs. Contactez un administrateur si vous pensez que c'est une erreur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/")}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-primary text-white py-8 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
            <h1 className="text-4xl font-bold">Administration</h1>
            <p className="text-white/80 mt-2">Connexion requise</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-16">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Connexion Administrateur
              </CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à l'interface d'administration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lotobonheur.ci"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-primary text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 mb-4"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
              <h1 className="text-4xl font-bold">Administration</h1>
              <p className="text-white/80 mt-2">Gestion des résultats et maintenance</p>
            </div>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Ajouter un Résultat Manuellement</CardTitle>
              <CardDescription>
                Entrez les informations du tirage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="draw-name">Tirage</Label>
                <Select value={drawName} onValueChange={setDrawName}>
                  <SelectTrigger id="draw-name">
                    <SelectValue placeholder="Sélectionnez un tirage" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDraws.map((draw) => (
                      <SelectItem key={draw.name} value={draw.name}>
                        {draw.name} - {draw.day} {draw.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="draw-date">Date</Label>
                <Input
                  id="draw-date"
                  type="date"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Numéros Gagnants (5 numéros entre 1-90)</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {numbers.map((num, idx) => (
                    <Input
                      key={idx}
                      type="number"
                      min="1"
                      max="90"
                      value={num}
                      onChange={(e) => handleNumberChange(idx, e.target.value)}
                      placeholder={`N°${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddResult}
                disabled={isLoading}
                className="w-full"
              >
                Ajouter le Résultat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Opérations de maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleScrapeResults}
                disabled={isLoading}
                className="w-full gap-2"
                variant="default"
              >
                <RefreshCw className="w-4 h-4" />
                Scraper les Résultats
              </Button>

              <Button
                onClick={handleExportData}
                className="w-full gap-2"
                variant="secondary"
              >
                <Download className="w-4 h-4" />
                Exporter les Données (JSON)
              </Button>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Upload className="w-4 h-4" />
                  Importer des Données (JSON)
                </Button>
              </div>

              <Button
                onClick={handleDeleteOldResults}
                disabled={isLoading}
                className="w-full gap-2"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer Résultats &gt; 6 mois
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>⚠️ Note:</strong> Cette interface est réservée aux administrateurs. 
              Toutes les modifications sont permanentes et affectent la base de données en temps réel.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
