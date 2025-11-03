import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, History as HistoryIcon, Search, Calendar, Filter } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useDrawResults } from "@/hooks/useDrawResults";
import { DrawResultsSkeleton } from "@/components/LoadingSkeleton";
import { NumberBall } from "@/components/NumberBall";
import { DRAW_SCHEDULE } from "@/types/lottery";
import { UserNav } from "@/components/UserNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const History = () => {
  const navigate = useNavigate();
  const { data: allResults = [], isLoading } = useDrawResults(undefined, 1000);
  const [searchDate, setSearchDate] = useState("");
  const [filterDraw, setFilterDraw] = useState("all");
  
  const allDraws = Object.values(DRAW_SCHEDULE).flat();

  const filteredResults = allResults.filter((result) => {
    const matchesDate = !searchDate || result.draw_date.includes(searchDate);
    const matchesDraw = filterDraw === "all" || result.draw_name === filterDraw;
    return matchesDate && matchesDraw;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-primary text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
            <UserNav />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <HistoryIcon className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Historique des Tirages</h1>
          </div>
          <p className="text-white/80 mt-2">
            Consultez tous les résultats passés avec filtres avancés
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 flex-1">
        <Card className="bg-gradient-card border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filtres de Recherche
            </CardTitle>
            <CardDescription>
              Affinez votre recherche avec les filtres ci-dessous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  placeholder="Rechercher par date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Tirage
                </label>
                <Select value={filterDraw} onValueChange={setFilterDraw}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les tirages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les tirages</SelectItem>
                    {allDraws.map((draw) => (
                      <SelectItem key={draw.name} value={draw.name}>
                        {draw.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Résultats ({filteredResults.length})</span>
              {(searchDate || filterDraw !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchDate("");
                    setFilterDraw("all");
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DrawResultsSkeleton />
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HistoryIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Aucun résultat trouvé pour ces critères</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Tirage</TableHead>
                      <TableHead>Numéros Gagnants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow 
                        key={result.id}
                        className="hover:bg-accent/5 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {new Date(result.draw_date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold">{result.draw_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {result.draw_day} • {result.draw_time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {result.winning_numbers.map((num) => (
                              <NumberBall key={num} number={num} size="sm" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tirage/${result.draw_name}`)}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default History;
