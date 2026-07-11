"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetWorthHeroProps {
  netWorth: number;
  previousNetWorth?: number | null;
}

export function NetWorthHero({ netWorth, previousNetWorth }: NetWorthHeroProps) {
  const isPositive = netWorth >= 0;
  const change =
    previousNetWorth != null && previousNetWorth !== 0
      ? ((netWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100
      : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Patrimonio Neto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-3">
          <span
            className={cn(
              "text-3xl font-bold",
              isPositive ? "text-foreground" : "text-destructive",
            )}
          >
            {formatCurrency(netWorth)}
          </span>
          {change !== null && (
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                change >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
