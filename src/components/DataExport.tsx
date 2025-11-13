import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Database, Calendar, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserFavorites } from "@/hooks/useUserFavorites";
import { usePredictionTracking } from "@/hooks/usePredictionTracking";
import { useDrawResults } from "@/hooks/useDrawResults";
import { toast } from "sonner";

interface ExportOptions {
  favorites: boolean;
  predictions: boolean;
  results: boolean;
  preferences: boolean;
}

export const DataExport = () => {
  const { user } = useAuth();
  const { data: favorites } = useUserFavorites(user?.id);
  const { data: predictions } = usePredictionTracking(user?.id);
  const { data: results } = useDrawResults("", 100);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    favorites: true,
    predictions: true,
    results: false,
    preferences: true
  });
  const [format, setFormat] = useState("json");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleOption = (key: keyof ExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateExportData = () => {
    const exportData: any = {
      exportDate: new Date().toISOString(),
      userId: user?.id,
      version: "1.0"
    };

    if (exportOptions.favorites && favorites) {
      exportData.favorites = favorites.map(fav => ({
        id: fav.id,
        drawName: fav.draw_name,
        numbers: fav.favorite_numbers,
        notes: fav.notes,
        category: fav.category,
        createdAt: fav.created_at
      }));
    }

    if (exportOptions.predictions && predictions) {
      exportData.predictions = predictions.map(pred => ({
        id: pred.id,
        drawName: pred.draw_name,
        predictedNumbers: pred.predicted_numbers,
        actualNumbers: pred.actual_numbers,
        matches: pred.matches,
        algorithm: pred.algorithm_used,
        createdAt: pred.created_at
      }));
    }

    if (exportOptions.results && results) {
      exportData.results = results.slice(0, 50).map(result => ({
        drawName: result.draw_name,
        drawDate: result.draw_date,
        winningNumbers: result.winning_numbers,
        machineNumbers: result.machine_numbers
      }));
    }

    if (exportOptions.preferences) {
      exportData.preferences = {
        exportNote: "Préférences utilisateur - données sensibles exclues"
      };
    }

    return exportData;
  };

  const downloadFile = (data: any, filename: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = (data: any) => {
    const jsonString = JSON.stringify(data, null, 2);
    const filename = `loto-lumiere-export-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonString, filename, 'application/json');
  };

  const exportAsCSV = (data: any) => {
    let csvContent = "";

    if (data.favorites) {
      csvContent += "FAVORIS\n";
      csvContent += "ID,Tirage,Numéros,Notes,Catégorie,Date\n";
      data.favorites.forEach((fav: any) => {
        csvContent += `${fav.id},"${fav.drawName}","${fav.numbers.join(', ')}","${fav.notes || ''}","${fav.category || ''}","${fav.createdAt}"\n`;
      });
      csvContent += "\n";
    }

    if (data.predictions) {
      csvContent += "PRÉDICTIONS\n";
      csvContent += "ID,Tirage,Numéros Prédits,Numéros Réels,Correspondances,Algorithme,Date\n";
      data.predictions.forEach((pred: any) => {
        csvContent += `${pred.id},"${pred.drawName}","${pred.predictedNumbers.join(', ')}","${pred.actualNumbers?.join(', ') || ''}",${pred.matches},"${pred.algorithm}","${pred.createdAt}"\n`;
      });
      csvContent += "\n";
    }

    if (data.results) {
      csvContent += "RÉSULTATS\n";
      csvContent += "Tirage,Date,Numéros Gagnants,Numéros Machine\n";
      data.results.forEach((result: any) => {
        csvContent += `"${result.drawName}","${result.drawDate}","${result.winningNumbers.join(', ')}","${result.machineNumbers?.join(', ') || ''}"\n`;
      });
    }

    const filename = `loto-lumiere-export-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
  };

  const handleExport = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour exporter vos données");
      return;
    }

    const hasSelectedOptions = Object.values(exportOptions).some(Boolean);
    if (!hasSelectedOptions) {
      toast.error("Veuillez sélectionner au moins une option d'export");
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      // Simulation du progress
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const exportData = generateExportData();

      if (format === "json") {
        exportAsJSON(exportData);
      } else if (format === "csv") {
        exportAsCSV(exportData);
      }

      toast.success("Export terminé avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'export");
      console.error(error);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const getDataCount = () => {
    let count = 0;
    if (exportOptions.favorites) count += favorites?.length || 0;
    if (exportOptions.predictions) count += predictions?.length || 0;
    if (exportOptions.results) count += Math.min(results?.length || 0, 50);
    return count;
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Export de Données
        </CardTitle>
        <CardDescription>
          Exportez vos données personnelles dans différents formats
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Options d'export */}
        <div className="space-y-4">
          <h4 className="font-medium">Données à exporter</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorites"
                  checked={exportOptions.favorites}
                  onCheckedChange={() => toggleOption('favorites')}
                />
                <label htmlFor="favorites" className="text-sm cursor-pointer">
                  Numéros favoris ({favorites?.length || 0})
                </label>
              </div>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="predictions"
                  checked={exportOptions.predictions}
                  onCheckedChange={() => toggleOption('predictions')}
                />
                <label htmlFor="predictions" className="text-sm cursor-pointer">
                  Historique des prédictions ({predictions?.length || 0})
                </label>
              </div>
              <Database className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="results"
                  checked={exportOptions.results}
                  onCheckedChange={() => toggleOption('results')}
                />
                <label htmlFor="results" className="text-sm cursor-pointer">
                  Résultats récents (50 derniers)
                </label>
              </div>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preferences"
                  checked={exportOptions.preferences}
                  onCheckedChange={() => toggleOption('preferences')}
                />
                <label htmlFor="preferences" className="text-sm cursor-pointer">
                  Préférences utilisateur
                </label>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Format d'export */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Format d'export</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON (recommandé)</SelectItem>
              <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Informations sur l'export */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Éléments sélectionnés:</strong> {getDataCount()} entrées
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            L'export inclura uniquement vos données personnelles. 
            Aucune donnée sensible ne sera exportée.
          </p>
        </div>

        {/* Progress bar */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Export en cours...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Bouton d'export */}
        <Button 
          onClick={handleExport}
          disabled={isExporting || !user}
          className="w-full gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Export en cours..." : "Exporter mes données"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Vos données sont exportées localement et ne sont pas envoyées vers des serveurs tiers
        </p>
      </CardContent>
    </Card>
  );
};