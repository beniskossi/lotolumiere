import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { AdvancedPrediction } from "@/hooks/useAdvancedPrediction";
import { TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";

interface EnhancedPredictionChartsProps {
  predictions: AdvancedPrediction[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const EnhancedPredictionCharts = ({ predictions }: EnhancedPredictionChartsProps) => {
  // Prepare data for confidence comparison
  const confidenceData = predictions.map(pred => ({
    name: pred.algorithm.substring(0, 15),
    confidence: Math.round(pred.confidence * 100),
    score: pred.score,
  }));

  // Prepare data for category distribution
  const categoryCount = predictions.reduce((acc, pred) => {
    acc[pred.category] = (acc[pred.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Prepare radar data for algorithm comparison
  const radarData = predictions.map(pred => ({
    algorithm: pred.algorithm.substring(0, 10),
    confidence: pred.confidence * 100,
    score: pred.score,
    factors: pred.factors.length * 10,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Comparaison des Confiances
          </CardTitle>
          <CardDescription>
            Niveau de confiance par algorithme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="confidence" fill="#8b5cf6" name="Confiance %" />
              <Bar dataKey="score" fill="#3b82f6" name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Distribution des Catégories
          </CardTitle>
          <CardDescription>
            Répartition des types d'algorithmes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Analyse Multi-Critères
          </CardTitle>
          <CardDescription>
            Comparaison radar des performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="algorithm" />
              <PolarRadiusAxis />
              <Radar name="Confiance" dataKey="confidence" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="Facteurs" dataKey="factors" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};