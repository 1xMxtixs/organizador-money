"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { MonthlySummary } from "@/components/dashboard/monthly-summary";
import { BalanceLineChart } from "@/components/dashboard/balance-line-chart";
import { TopCategories } from "@/components/dashboard/top-categories";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CashflowSummary } from "@/components/dashboard/cashflow-summary";
import { AccountCards } from "@/components/dashboard/account-cards";
import { PlanningWidget } from "@/components/dashboard/planning-widget";
import type { AccountType } from "@/lib/validations/account";

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

interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string | null;
  balance?: number;
  currencyCode: string;
}

export function DashboardContent() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [evolution, setEvolution] = useState<MonthBalance[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryRank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [
          summaryRes,
          distRes,
          evoRes,
          accountsRes,
        ] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/dashboard/category-distribution"),
          fetch("/api/dashboard/balance-evolution"),
          fetch("/api/accounts"),
        ]);

        const [summaryJson, distJson, evoJson, accountsJson] = await Promise.all([
          summaryRes.json() as Promise<{ data: SummaryData }>,
          distRes.json() as Promise<{ data: CategoryDistribution[] }>,
          evoRes.json() as Promise<{ data: MonthBalance[] }>,
          accountsRes.json() as Promise<{ data: Account[] }>,
        ]);

        if (!cancelled) {
          setSummary(summaryJson.data);
          setEvolution(evoJson.data ?? []);
          setAccounts(accountsJson.data ?? []);

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    );
  }

  const previousMonthBalance = evolution.length >= 2
    ? evolution[evolution.length - 2].balance
    : undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <BalanceCard
        totalBalance={summary?.totalBalance ?? 0}
        previousBalance={previousMonthBalance}
      />

      <MonthlySummary
        income={summary?.monthlyIncome ?? 0}
        expenses={summary?.monthlyExpenses ?? 0}
        savings={summary?.monthlySavings ?? 0}
      />

      <AccountCards accounts={accounts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BalanceLineChart data={evolution} />
        <CashflowSummary
          income={summary?.monthlyIncome ?? 0}
          expenses={summary?.monthlyExpenses ?? 0}
        />
      </div>

      <TopCategories categories={topCategories} />

      <PlanningWidget />

      <QuickActions />
    </div>
  );
}