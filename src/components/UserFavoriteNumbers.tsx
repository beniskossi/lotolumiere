import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NumberBall } from "./NumberBall";
import { useUserFavorites, useAddFavorite, useDeleteFavorite } from "@/hooks/useUserFavorites";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UserFavoriteNumbers = () => {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useUserFavorites(user?.id);
  const addFavorite = useAddFavorite();
  const deleteFavorite = useDeleteFavorite();
  const { toast } = useToast();

  const [newNumbers, setNewNumbers] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleAddNumber = () => {
    const num = parseInt(inputValue);
    if (isNaN(num) || num < 1 || num > 90) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nombre entre 1 et 90",
        variant: "destructive",
      });
      return;
    }
    
    if (newNumbers.includes(num)) {
      toast({
        title: "Erreur",
        description: "Ce numéro est déjà dans votre sélection",
        variant: "destructive",
      });
      return;
    }

    if (newNumbers.length >= 5) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez sélectionner que 5 numéros",
        variant: "destructive",
      });
      return;
    }

    setNewNumbers([...newNumbers, num].sort((a, b) => a - b));
    setInputValue("");
  };

  const handleRemoveNumber = (num: number) => {
    setNewNumbers(newNumbers.filter(n => n !== num));
  };

  const handleSaveFavorite = async () => {
    if (newNumbers.length !== 5) {
      toast({
        title: "Erreur",
        description: "Vous devez sélectionner exactement 5 numéros",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    await addFavorite.mutateAsync({
      user_id: user.id,
      draw_name: "Midi",
      favorite_numbers: newNumbers,
      notes: notes || null,
    });

    setNewNumbers([]);
    setNotes("");
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Ajouter des Numéros Favoris
          </CardTitle>
          <CardDescription>
            Sauvegardez vos combinaisons préférées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="90"
              placeholder="Entrez un numéro (1-90)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddNumber()}
            />
            <Button onClick={handleAddNumber} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {newNumbers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newNumbers.map((num) => (
                <div key={num} className="relative group">
                  <NumberBall number={num} />
                  <button
                    onClick={() => handleRemoveNumber(num)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Textarea
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button 
            onClick={handleSaveFavorite} 
            disabled={newNumbers.length !== 5 || addFavorite.isPending}
            className="w-full"
          >
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {favorites && favorites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vos Favoris</h3>
          {favorites.map((fav) => (
            <Card key={fav.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap gap-2">
                      {fav.favorite_numbers.map((num) => (
                        <NumberBall key={num} number={num} />
                      ))}
                    </div>
                    {fav.notes && (
                      <p className="text-sm text-muted-foreground">{fav.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Créé le {new Date(fav.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFavorite.mutate(fav.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};