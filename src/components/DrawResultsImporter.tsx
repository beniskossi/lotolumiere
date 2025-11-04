import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Copy, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DRAW_SCHEDULE } from "@/types/lottery";

interface ParsedResult {
  draw_name: string;
  draw_date: string;
  winning_numbers: number[];
  machine_numbers?: number[];
  draw_day: string;
  draw_time: string;
}

export const DrawResultsImporter = ({ onImportComplete }: { onImportComplete?: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewResults, setPreviewResults] = useState<ParsedResult[]>([]);

  const allDraws = Object.values(DRAW_SCHEDULE).flat();

  const getDrawScheduleInfo = (drawName: string) => {
    const draw = allDraws.find(d => d.name.toLowerCase() === drawName.toLowerCase());
    return draw ? { day: draw.day, time: draw.time } : { day: "", time: "" };
  };

  const parseTextInput = (text: string): ParsedResult[] => {
    const results: ParsedResult[] = [];
    const lines = text.trim().split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Format attendu: "Tirage,Date,N1,N2,N3,N4,N5[,M1,M2,M3,M4,M5]"
      // ou: "Tirage Date N1 N2 N3 N4 N5 [M1 M2 M3 M4 M5]"
      const parts = line.split(/[,\s]+/).map(p => p.trim());
      
      if (parts.length < 7) continue; // Minimum: nom + date + 5 numéros
      
      const drawName = parts[0];
      const drawDate = parts[1]; // Format: YYYY-MM-DD ou DD/MM/YYYY
      const numbers = parts.slice(2, 7).map(n => parseInt(n));
      const machineNumbers = parts.length >= 12 ? parts.slice(7, 12).map(n => parseInt(n)) : undefined;
      
      // Valider les numéros
      if (numbers.some(n => isNaN(n) || n < 1 || n > 90) || numbers.length !== 5) continue;
      if (machineNumbers && (machineNumbers.some(n => isNaN(n) || n < 1 || n > 90) || machineNumbers.length !== 5)) continue;
      
      // Normaliser la date
      let normalizedDate = drawDate;
      if (drawDate.includes('/')) {
        const [day, month, year] = drawDate.split('/');
        normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const scheduleInfo = getDrawScheduleInfo(drawName);
      
      results.push({
        draw_name: drawName,
        draw_date: normalizedDate,
        winning_numbers: numbers,
        machine_numbers: machineNumbers?.length === 5 ? machineNumbers : undefined,
        draw_day: scheduleInfo.day,
        draw_time: scheduleInfo.time,
      });
    }
    
    return results;
  };

  const parseCsvFile = async (file: File): Promise<ParsedResult[]> => {
    const text = await file.text();
    const lines = text.trim().split('\n');
    const results: ParsedResult[] = [];
    
    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('tirage') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(/[,;]/).map(p => p.trim());
      
      if (parts.length < 7) continue;
      
      const drawName = parts[0];
      const drawDate = parts[1];
      const numbers = parts.slice(2, 7).map(n => parseInt(n));
      const machineNumbers = parts.length >= 12 ? parts.slice(7, 12).map(n => parseInt(n)) : undefined;
      
      if (numbers.some(n => isNaN(n) || n < 1 || n > 90) || numbers.length !== 5) continue;
      if (machineNumbers && (machineNumbers.some(n => isNaN(n) || n < 1 || n > 90) || machineNumbers.length !== 5)) continue;
      
      let normalizedDate = drawDate;
      if (drawDate.includes('/')) {
        const [day, month, year] = drawDate.split('/');
        normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const scheduleInfo = getDrawScheduleInfo(drawName);
      
      results.push({
        draw_name: drawName,
        draw_date: normalizedDate,
        winning_numbers: numbers,
        machine_numbers: machineNumbers?.length === 5 ? machineNumbers : undefined,
        draw_day: scheduleInfo.day,
        draw_time: scheduleInfo.time,
      });
    }
    
    return results;
  };

  const handlePreviewText = () => {
    const results = parseTextInput(pastedText);
    setPreviewResults(results);
    
    if (results.length === 0) {
      toast({
        title: "Aucun résultat valide",
        description: "Vérifiez le format de vos données",
        variant: "destructive",
      });
    }
  };

  const handlePreviewCsv = async () => {
    if (!csvFile) return;
    
    try {
      const results = await parseCsvFile(csvFile);
      setPreviewResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Aucun résultat valide",
          description: "Vérifiez le format de votre fichier CSV",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier CSV",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (previewResults.length === 0) return;
    
    setIsLoading(true);
    try {
      let insertedCount = 0;
      let skippedCount = 0;
      
      for (const result of previewResults) {
        // Check if result already exists
        const { data: existing } = await supabase
          .from("draw_results")
          .select("id")
          .eq("draw_name", result.draw_name)
          .eq("draw_date", result.draw_date)
          .maybeSingle();
        
        if (existing) {
          skippedCount++;
          continue;
        }
        
        const { error } = await supabase.from("draw_results").insert(result);
        
        if (error) {
          console.error("Error inserting:", error);
        } else {
          insertedCount++;
        }
      }
      
      toast({
        title: "✓ Import terminé",
        description: `${insertedCount} résultat(s) importé(s), ${skippedCount} doublon(s) ignoré(s)`,
      });
      
      // Reset
      setPastedText("");
      setCsvFile(null);
      setPreviewResults([]);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'import",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Tirage,Date,N1,N2,N3,N4,N5,M1,M2,M3,M4,M5
Reveil,2024-01-15,12,23,45,67,89,5,10,20,30,40
Etoile,2024-01-15,8,15,27,56,78,,,,,`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-import.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gradient-card border-border/50 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Import Facilité
        </CardTitle>
        <CardDescription>
          Importez plusieurs résultats en une fois via CSV ou copier-coller
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="gap-2">
              <Copy className="w-4 h-4" />
              Copier-Coller
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2">
              <FileText className="w-4 h-4" />
              Fichier CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Format:</strong> Une ligne par résultat<br/>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">Tirage Date N1 N2 N3 N4 N5 [M1 M2 M3 M4 M5]</code><br/>
                <strong>Exemple:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">Reveil 2024-01-15 12 23 45 67 89</code>
              </AlertDescription>
            </Alert>
            
            <div>
              <Label>Collez vos résultats ici</Label>
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Reveil 2024-01-15 12 23 45 67 89&#10;Etoile 2024-01-15 8 15 27 56 78 5 10 20 30 40"
                rows={8}
                className="mt-2 font-mono text-xs"
              />
            </div>
            
            <Button onClick={handlePreviewText} disabled={!pastedText.trim()}>
              Prévisualiser
            </Button>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Format CSV:</strong> Colonnes séparées par des virgules ou points-virgules<br/>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">Tirage,Date,N1,N2,N3,N4,N5[,M1,M2,M3,M4,M5]</code>
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="w-4 h-4" />
                Télécharger un modèle
              </Button>
            </div>
            
            <div>
              <Label>Choisir un fichier CSV</Label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="mt-2 block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90 file:cursor-pointer"
              />
            </div>
            
            <Button onClick={handlePreviewCsv} disabled={!csvFile}>
              Prévisualiser
            </Button>
          </TabsContent>
        </Tabs>

        {/* Preview Section */}
        {previewResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">
                Prévisualisation ({previewResults.length} résultat{previewResults.length > 1 ? 's' : ''})
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2 bg-muted/50 rounded-lg p-3">
                {previewResults.map((result, idx) => (
                  <div key={idx} className="text-xs bg-background rounded p-2 border">
                    <div className="font-medium">{result.draw_name}</div>
                    <div className="text-muted-foreground">
                      {new Date(result.draw_date).toLocaleDateString('fr-FR')} • 
                      {result.draw_day} {result.draw_time}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <span className="text-muted-foreground">Gagnants:</span>
                      {result.winning_numbers.map((n, i) => (
                        <span key={i} className="font-mono font-semibold">{n}</span>
                      ))}
                    </div>
                    {result.machine_numbers && (
                      <div className="flex gap-1 mt-1">
                        <span className="text-muted-foreground">Machine:</span>
                        {result.machine_numbers.map((n, i) => (
                          <span key={i} className="font-mono font-semibold">{n}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={isLoading} className="gap-2">
                <Upload className="w-4 h-4" />
                {isLoading ? "Import en cours..." : `Importer ${previewResults.length} résultat(s)`}
              </Button>
              <Button variant="outline" onClick={() => setPreviewResults([])}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
