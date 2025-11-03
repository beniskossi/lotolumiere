import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberStatistic } from "@/hooks/useNumberStatistics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface StatisticsChartsProps {
  mostFrequent: NumberStatistic[];
  leastFrequent: NumberStatistic[];
  drawName: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(230 60% 50%)",
  "hsl(35 90% 50%)",
  "hsl(145 55% 50%)",
  "hsl(330 70% 55%)",
  "hsl(25 90% 50%)",
  "hsl(220 10% 45%)",
];

export const StatisticsCharts = ({ mostFrequent, leastFrequent, drawName }: StatisticsChartsProps) => {
  const frequencyData = mostFrequent.map((stat) => ({
    number: `N°${stat.number}`,
    frequency: stat.frequency,
    fill: COLORS[mostFrequent.indexOf(stat) % COLORS.length],
  }));

  const gapData = leastFrequent.map((stat) => ({
    number: `N°${stat.number}`,
    days: stat.days_since_last,
    fill: COLORS[leastFrequent.indexOf(stat) % COLORS.length],
  }));

  // Distribution par tranche de 10
  const rangeDistribution = Array.from({ length: 9 }, (_, i) => {
    const start = i * 10 + 1;
    const end = i === 8 ? 90 : (i + 1) * 10;
    const range = `${start}-${end}`;
    
    const count = mostFrequent.filter(stat => {
      return stat.number >= start && stat.number <= end;
    }).reduce((sum, stat) => sum + stat.frequency, 0);

    return { range, count, fill: COLORS[i] };
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Fréquence des Numéros les Plus Sortis</CardTitle>
          <CardDescription>
            Top 10 des numéros qui apparaissent le plus souvent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={frequencyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="number" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="frequency" radius={[8, 8, 0, 0]}>
                {frequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Distribution par Tranche</CardTitle>
            <CardDescription>
              Répartition des apparitions par groupe de 10 numéros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rangeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                >
                  {rangeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Écarts Maximums</CardTitle>
            <CardDescription>
              Numéros avec les plus grands écarts d'apparition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gapData} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--foreground))" }} />
                <YAxis 
                  dataKey="number" 
                  type="category" 
                  width={50}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="days" radius={[0, 8, 8, 0]}>
                  {gapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
