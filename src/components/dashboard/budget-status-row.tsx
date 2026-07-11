"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface BudgetItem {
  id: string;
  category: { name: string; icon: string; color: string };
  amountLimit: number;
  currentPeriod: {
    amountSpent: number;
    variance: number;
    status: "under" | "on-target" | "over";
  } | null;
}

interface BudgetStatusRowProps {
  budgets: BudgetItem[];
}

const STATUS_COLORS = {
  under: "bg-green-500",
  "on-target": "bg-yellow-500",
  over: "bg-red-500",
} as const;

export function BudgetStatusRow({ budgets }: BudgetStatusRowProps) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Presupuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay presupuestos activos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Presupuestos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {budgets.slice(0, 5).map((budget) => {
            const spent = budget.currentPeriod?.amountSpent ?? 0;
            const limit = budget.amountLimit;
            const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
            const status = budget.currentPeriod?.status ?? "under";

            return (
              <div key={budget.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{budget.category.icon}</span>
                    <span className="truncate">{budget.category.name}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    {formatCurrency(spent)} / {formatCurrency(limit)}
                  </span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${STATUS_COLORS[status]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
