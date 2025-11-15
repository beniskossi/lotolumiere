import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

export const CreateAdminAccount = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateAdmin = async () => {
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Créer le profil utilisateur avec rôle admin
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            username: email.split("@")[0],
            full_name: "Administrateur",
            role: "admin",
          });

        if (profileError) throw profileError;

        toast({
          title: "✓ Compte admin créé",
          description: "Le compte administrateur a été créé avec succès",
        });

        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte admin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Créer un Compte Administrateur
        </CardTitle>
        <CardDescription>
          Créez un nouveau compte avec des privilèges d'administration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@lotolumiere.ci"
          />
        </div>
        <div>
          <Label htmlFor="admin-password">Mot de passe</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
          />
        </div>
        <Button
          onClick={handleCreateAdmin}
          disabled={isLoading}
          className="w-full gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {isLoading ? "Création..." : "Créer le compte admin"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Ce compte aura accès à toutes les fonctions d'administration
        </p>
      </CardContent>
    </Card>
  );
};
