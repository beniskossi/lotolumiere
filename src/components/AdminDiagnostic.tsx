import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export const AdminDiagnostic = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminRole(user?.id);
  const { toast } = useToast();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Vérifier le profil utilisateur
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // Vérifier le rôle admin
      const { data: adminRole } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setDiagnosticData({
        userId: user.id,
        email: user.email,
        hasProfile: !!profile,
        hasAdminRole: !!adminRole,
        profile,
        adminRole
      });
    } catch (error) {
      console.error("Diagnostic error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAdminRole = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("admin_roles")
        .insert({
          user_id: user.id,
          role: "admin"
        });

      if (error) throw error;

      toast({
        title: "✓ Rôle admin ajouté",
        description: "Vous avez maintenant les privilèges d'administration",
      });

      runDiagnostic();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      runDiagnostic();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Connectez-vous pour voir le diagnostic
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Diagnostic Admin
        </CardTitle>
        <CardDescription>
          Vérifiez votre statut d'administrateur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Statut Admin</span>
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : isAdmin ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>

        {diagnosticData && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>User ID:</span>
              <code className="text-xs bg-muted px-1 rounded">
                {diagnosticData.userId.slice(0, 8)}...
              </code>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span>{diagnosticData.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Profil utilisateur:</span>
              {diagnosticData.hasProfile ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex justify-between">
              <span>Rôle admin:</span>
              {diagnosticData.hasAdminRole ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={runDiagnostic}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          
          {diagnosticData && !diagnosticData.hasAdminRole && (
            <Button
              onClick={addAdminRole}
              size="sm"
            >
              Ajouter rôle admin
            </Button>
          )}
        </div>

        {diagnosticData && !diagnosticData.hasAdminRole && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Rôle admin manquant
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
              Cliquez sur "Ajouter rôle admin" ou exécutez le script SQL fourni
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};