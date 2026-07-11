"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface TrendPoint {
  month: string;
  netWorth: number;
}

interface NetWorthMiniProps {
  netWorth: number;
  trend: TrendPoint[];
}

export function NetWorthMini({ netWorth, trend }: NetWorthMiniProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Patrimonio neto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(netWorth)}
            </p>
            <p className="text-xs text-muted-foreground">Actual</p>
          </div>
          {trend.length > 1 && (
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(label) => label}
                  />
                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#sparkGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
