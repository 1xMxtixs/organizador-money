"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetBreakdownProps {
  breakdown: Record<string, number>;
}

const typeLabels: Record<string, string> = {
  checking: "Cuenta corriente",
  savings: "Ahorro",
  investment: "Inversiones",
  cash: "Efectivo",
  real_estate: "Bienes raíces",
};

const typeColors: Record<string, string> = {
  checking: "bg-blue-500",
  savings: "bg-green-500",
  investment: "bg-purple-500",
  cash: "bg-yellow-500",
  real_estate: "bg-orange-500",
};

export function AssetBreakdown({ breakdown }: AssetBreakdownProps) {
  const entries = Object.entries(breakdown).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay activos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Activos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map(([type, amount]) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${typeColors[type] ?? "bg-gray-400"}`} />
              <span className="text-sm">{typeLabels[type] ?? type}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">{formatCurrency(amount)}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {total > 0 ? Math.round((amount / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
