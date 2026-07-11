"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DistributionData {
  needs: number;
  wants: number;
  savings: number;
}

interface CategoryBreakdown {
  name: string;
  type: "needs" | "wants" | "savings";
  amount: number;
}

interface DistributionChartProps {
  distribution: DistributionData;
  categoryBreakdown: CategoryBreakdown[];
}

const TYPE_CONFIG = {
  needs: { label: "Necesidades", color: "hsl(var(--chart-1))" },
  wants: { label: "Deseos", color: "hsl(var(--chart-2))" },
  savings: { label: "Ahorros", color: "hsl(var(--chart-3))" },
} as const;

const IDEAL = { needs: 50, wants: 30, savings: 20 };

export function DistributionChart({
  distribution,
  categoryBreakdown,
}: DistributionChartProps) {
  const total = distribution.needs + distribution.wants + distribution.savings;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Distribución 50/30/20</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin gastos este mes
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Necesidades", value: distribution.needs, color: TYPE_CONFIG.needs.color },
    { name: "Deseos", value: distribution.wants, color: TYPE_CONFIG.wants.color },
    { name: "Ahorros", value: distribution.savings, color: TYPE_CONFIG.savings.color },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Distribución 50/30/20</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={45}
              strokeWidth={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="hsl(var(--background))" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-3 space-y-2">
          {(["needs", "wants", "savings"] as const).map((type) => {
            const amount = distribution[type];
            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
            const ideal = IDEAL[type];
            const diff = pct - ideal;
            return (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: TYPE_CONFIG[type].color }}
                  />
                  <span>{TYPE_CONFIG[type].label}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{formatCurrency(amount)}</span>
                  <span className="tabular-nums">
                    {pct}%
                    <span
                      className={
                        diff > 0
                          ? "ml-1 text-destructive"
                          : diff < 0
                            ? "ml-1 text-green-600"
                            : ""
                      }
                    >
                      {diff > 0 ? `+${diff}` : diff === 0 ? "" : diff}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
