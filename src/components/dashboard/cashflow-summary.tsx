"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CashflowSummaryProps {
  income: number;
  expenses: number;
}

export function CashflowSummary({ income, expenses }: CashflowSummaryProps) {
  const data = [
    { name: "Ingresos", value: income, color: "hsl(var(--chart-2))" },
    { name: "Gastos", value: expenses, color: "hsl(var(--destructive))" },
  ];

  const maxValue = Math.max(income, expenses);

  if (maxValue === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Flujo de caja mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin datos este mes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Flujo de caja mensual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(v: number) =>
                v >= 1000000
                  ? `${Math.round(v / 1000000)}M`
                  : v >= 1000
                  ? `${Math.round(v / 1000)}k`
                  : `${v}`
              }
              width={50}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="top"
              iconType="square"
              wrapperStyle={{ paddingTop: "8px", paddingBottom: "8px" }}
            />
            <Bar
              dataKey="value"
              fill="#8884d8"
              radius={[0, 4, 4, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
            <p className="text-sm text-muted-foreground">Ingresos</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <p className="text-sm text-muted-foreground">Gastos</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(expenses)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}