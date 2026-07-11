"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, WalletIcon, PercentIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { SummaryBarProps } from "@/types/monthly";

const metrics = [
  { key: "income" as const, label: "Ingresos", icon: TrendingUpIcon, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  { key: "expenses" as const, label: "Gastos", icon: TrendingDownIcon, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20" },
  { key: "balance" as const, label: "Balance", icon: WalletIcon, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" },
  { key: "savings" as const, label: "Ahorro", icon: PercentIcon, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/20" },
] as const;

export function SummaryBar({ summary }: SummaryBarProps) {
  const values: Record<string, string> = {
    income: formatCurrency(summary.totalIncome),
    expenses: formatCurrency(summary.totalExpenses),
    balance: formatCurrency(summary.balance),
    savings: summary.savingsRate !== null ? `${summary.savingsRate}%` : "—",
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.key} size="sm">
          <CardContent className="flex items-center gap-3">
            <div className={`flex size-9 items-center justify-center rounded-lg ${m.bg}`}>
              <m.icon className={`size-4 ${m.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{m.label}</p>
              <p className="text-lg font-semibold leading-tight">{values[m.key]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
