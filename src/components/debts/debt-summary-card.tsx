"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface DebtSummary {
  totalDebt: number;
  count: number;
  avgInterestRate: number;
}

interface DebtSummaryCardProps {
  summary: DebtSummary | null;
}

export function DebtSummaryCard({ summary }: DebtSummaryCardProps) {
  if (!summary) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Deuda Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalDebt)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cuentas con Deuda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.count}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tasa Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{summary.avgInterestRate}%</span>
            {summary.avgInterestRate > 20 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
