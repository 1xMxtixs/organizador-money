"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { MonthlySummary } from "@/components/dashboard/monthly-summary";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { BalanceLineChart } from "@/components/dashboard/balance-line-chart";
import { TopCategories } from "@/components/dashboard/top-categories";
import { QuickActions } from "@/components/dashboard/quick-actions";

export const metadata: Metadata = {
  title: "Dashboard — Finanzas",
};

interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
}

interface CategoryDistribution {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
}

interface MonthBalance {
  month: string;
  balance: number;
}

interface CategoryRank {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [distribution, setDistribution] = useState<CategoryDistribution[]>([]);
  const [evolution, setEvolution] = useState<MonthBalance[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [summaryRes, distRes, evoRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/dashboard/category-distribution"),
          fetch("/api/dashboard/balance-evolution"),
        ]);

        const [summaryJson, distJson, evoJson] = await Promise.all([
          summaryRes.json(),
          distRes.json(),
          evoRes.json(),
        ]);

        if (!cancelled) {
          setSummary(summaryJson.data);
          setDistribution(distJson.data ?? []);
          setEvolution(evoJson.data ?? []);

          // Compute top categories from distribution
          const dist = distJson.data ?? [];
          const total = dist.reduce(
            (sum: number, d: CategoryDistribution) => sum + d.amount,
            0,
          );
          const top = dist
            .sort(
              (a: CategoryDistribution, b: CategoryDistribution) =>
                b.amount - a.amount,
            )
            .slice(0, 5)
            .map((d: CategoryDistribution) => ({
              name: d.name,
              icon: d.icon,
              amount: d.amount,
              percentage: total > 0 ? Math.round((d.amount / total) * 100) : 0,
            }));
          setTopCategories(top);
        }
      } catch {
        if (!cancelled) console.error("Error loading dashboard data");
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
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <BalanceCard totalBalance={summary?.totalBalance ?? 0} />

      <MonthlySummary
        income={summary?.monthlyIncome ?? 0}
        expenses={summary?.monthlyExpenses ?? 0}
        savings={summary?.monthlySavings ?? 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ExpensePieChart data={distribution} />
        <BalanceLineChart data={evolution} />
      </div>

      <TopCategories categories={topCategories} />

      <QuickActions />
    </div>
  );
}
