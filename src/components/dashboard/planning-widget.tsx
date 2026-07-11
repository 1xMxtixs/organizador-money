"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DistributionChart } from "@/components/dashboard/distribution-chart";
import { SavingsRateBadge } from "@/components/dashboard/savings-rate-badge";
import { BudgetStatusRow } from "@/components/dashboard/budget-status-row";
import { NetWorthMini } from "@/components/dashboard/net-worth-mini";

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

interface TrendPoint {
  month: string;
  netWorth: number;
}

interface PlanningData {
  distribution: DistributionData;
  categoryBreakdown: CategoryBreakdown[];
  savingsRate: number | null;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface TrendDataPoint {
  month: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

export function PlanningWidget() {
  const [planning, setPlanning] = useState<PlanningData | null>(null);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [planningRes, budgetsRes, trendRes] = await Promise.all([
          fetch("/api/dashboard/planning"),
          fetch("/api/budgets"),
          fetch("/api/net-worth/trend?months=6"),
        ]);

        const [planningJson, budgetsJson, trendJson] = await Promise.all([
          planningRes.json() as Promise<{ data: PlanningData }>,
          budgetsRes.json() as Promise<{ data: BudgetItem[] }>,
          trendRes.json() as Promise<{ data: TrendDataPoint[] }>,
        ]);

        if (!cancelled) {
          setPlanning(planningJson.data ?? null);
          setBudgets(budgetsJson.data ?? []);
          setTrend(trendJson.data ?? []);
        }
      } catch {
        if (!cancelled) console.error("Error loading planning data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!planning) return null;

  const trendPoints: TrendPoint[] = trend.map((t: TrendDataPoint) => ({
    month: t.month,
    netWorth: t.netWorth,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight">Planificación</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DistributionChart
          distribution={planning.distribution}
          categoryBreakdown={planning.categoryBreakdown}
        />
        <SavingsRateBadge rate={planning.savingsRate} />
        <BudgetStatusRow budgets={budgets} />
        <NetWorthMini netWorth={planning.netWorth} trend={trendPoints} />
      </div>
    </div>
  );
}
