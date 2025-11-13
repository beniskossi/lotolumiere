import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberBall } from "./NumberBall";
import { useUserFavorites, useAddFavorite, useDeleteFavorite } from "@/hooks/useUserFavorites";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, Star, Copy, Share2, TrendingUp, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { favoriteSchema, validateData } from "@/lib/validations";
import { sanitizeNumbers, sanitizeString } from "@/lib/sanitize";
import { useToast } from "@/hooks/use-toast";
import { DRAW_SCHEDULE, DAYS_ORDER } from "@/types/lottery";

export const UserFavoriteNumbers = () => {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useUserFavorites(user?.id);
  const addFavorite = useAddFavorite();
  const deleteFavorite = useDeleteFavorite();
  const { toast } = useToast();

  const [newNumbers, setNewNumbers] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedDraw, setSelectedDraw] = useState("Midi");
  const [category, setCategory] = useState("personnel");
  const [filterDraw, setFilterDraw] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const filteredFavorites = (favorites || []).filter(fav => {
    const matchDraw = filterDraw === "all" || fav.draw_name === filterDraw;
    const matchCategory = filterCategory === "all" || fav.category === filterCategory;
    return matchDraw && matchCategory;
  });
  
  const totalCount = filteredFavorites.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFavorites = filteredFavorites.slice(startIndex, endIndex);
  
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const allDraws = DAYS_ORDER.flatMap(day => DRAW_SCHEDULE[day]);

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
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    const sanitizedNumbers = sanitizeNumbers(newNumbers);
    const sanitizedNotes = notes ? sanitizeString(notes) : null;

    const validation = validateData(favoriteSchema, {
      user_id: user.id,
      draw_name: selectedDraw,
      favorite_numbers: sanitizedNumbers,
      notes: sanitizedNotes,
      category: category,
    });

    if (!validation.success) {
      const firstError = Object.values(validation.errors)[0]?.[0];
      toast({
        title: "Erreur de validation",
        description: firstError || "Données invalides",
        variant: "destructive",
      });
      return;
    }

    await addFavorite.mutateAsync(validation.data);

    setNewNumbers([]);
    setNotes("");
    setCategory("personnel");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tirage</label>
              <Select value={selectedDraw} onValueChange={setSelectedDraw}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allDraws.map(draw => (
                    <SelectItem key={draw.name} value={draw.name}>
                      {draw.name} - {draw.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personnel">Personnel</SelectItem>
                  <SelectItem value="famille">Famille</SelectItem>
                  <SelectItem value="anniversaire">Anniversaire</SelectItem>
                  <SelectItem value="chance">Porte-bonheur</SelectItem>
                  <SelectItem value="analyse">Basé sur analyse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Vos Favoris ({totalCount})</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterDraw} onValueChange={(v) => { setFilterDraw(v); handleFilterChange(); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tirage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les tirages</SelectItem>
                  {Array.from(new Set(favorites.map(f => f.draw_name))).map(draw => (
                    <SelectItem key={draw} value={draw}>{draw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); handleFilterChange(); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="personnel">Personnel</SelectItem>
                <SelectItem value="famille">Famille</SelectItem>
                <SelectItem value="anniversaire">Anniversaire</SelectItem>
                <SelectItem value="chance">Porte-bonheur</SelectItem>
                <SelectItem value="analyse">Basé sur analyse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {paginatedFavorites.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun favori ne correspond aux filtres
            </p>
          ) : (
            <>
            {paginatedFavorites.map((fav) => (
            <Card key={fav.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{fav.draw_name}</Badge>
                        {fav.category && (
                          <Badge variant="secondary">{fav.category}</Badge>
                        )}
                      </div>
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(fav.favorite_numbers.join(', '));
                          toast({ title: "Numéros copiés!" });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Mes numéros favoris',
                              text: `Numéros: ${fav.favorite_numbers.join(', ')} pour ${fav.draw_name}`
                            });
                          }
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFavorite.mutate(fav.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </>
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
                <span className="ml-2">({startIndex + 1}-{Math.min(endIndex, totalCount)} sur {totalCount})</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};