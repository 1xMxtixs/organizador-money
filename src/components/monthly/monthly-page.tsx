"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlyStore } from "@/stores/monthly-store";
import { SummaryBar } from "./summary-bar";
import { MonthNavigator } from "./month-navigator";
import { ExpenseSection } from "./expense-section";
import { IncomeSection } from "./income-section";
import { RecentTransactions } from "./recent-transactions";

export function MonthlyPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMonth = searchParams.get("month");

  const { month, data, loading, error, setMonth, fetchData, optimisticQuickEntry, revertOptimistic } =
    useMonthlyStore();

  // Sync URL → store on mount
  useEffect(() => {
    if (urlMonth && urlMonth !== month) {
      setMonth(urlMonth);
    } else if (!urlMonth) {
      fetchData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMonthChange = useCallback(
    (newMonth: string) => {
      setMonth(newMonth);
      router.push(`/monthly?month=${newMonth}`, { scroll: false });
    },
    [setMonth, router],
  );

  const handleQuickEntry = useCallback(
    async (categoryId: string, amount: number) => {
      if (!data) return;
      const previousData = { ...data, categories: [...data.categories], summary: { ...data.summary } };

      optimisticQuickEntry(categoryId, amount);

      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: data.defaultAccountId,
            categoryId,
            amount,
            description: "Gasto rápido",
            date: new Date().toISOString().split("T")[0],
            type: "expense",
          }),
        });

        if (!res.ok) {
          revertOptimistic(previousData);
          toast.error("Error al registrar gasto");
          return;
        }

        toast.success("Gasto registrado");
        fetchData();
      } catch {
        revertOptimistic(previousData);
        toast.error("Error de red");
      }
    },
    [data, optimisticQuickEntry, revertOptimistic, fetchData],
  );

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const categories = data?.categories ?? [];
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");
  const accountId = data?.defaultAccountId ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Mensual</h1>
        <MonthNavigator currentMonth={month} onChange={handleMonthChange} />
      </div>

      <SummaryBar
        summary={data?.summary ?? { totalIncome: 0, totalExpenses: 0, balance: 0, savingsRate: null }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseSection
          categories={expenseCategories}
          accountId={accountId}
          onQuickEntry={handleQuickEntry}
        />
        <IncomeSection
          categories={incomeCategories}
          accountId={accountId}
          onQuickEntry={handleQuickEntry}
        />
      </div>

      <RecentTransactions transactions={data?.transactions ?? []} />
    </div>
  );
}
