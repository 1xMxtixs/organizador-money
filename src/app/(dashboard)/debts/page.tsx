"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DebtSummaryCard } from "@/components/debts/debt-summary-card";
import { DebtTable } from "@/components/debts/debt-table";
import { PayoffStrategyToggle } from "@/components/debts/payoff-strategy-toggle";
import { PayoffSchedule } from "@/components/debts/payoff-schedule";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PayoffStrategy } from "@/lib/debt-projection";

interface DebtAccount {
  id: string;
  name: string;
  type: string;
  bankName: string | null;
  balance: number;
  interestRate: number;
  isPaidOff: boolean;
}

interface DebtSummary {
  totalDebt: number;
  count: number;
  avgInterestRate: number;
}

interface ProjectionResult {
  debtId: string;
  strategy: string;
  monthlyPayment: number;
  schedule: Array<{
    month: number;
    balance: number;
    interest: number;
    principal: number;
    totalPaid: number;
  }>;
  totalInterest: number;
  payoffMonths: number;
  monthlyInterestWarning: boolean;
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtAccount[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<PayoffStrategy>("snowball");
  const [monthlyPayment, setMonthlyPayment] = useState<string>("100000");
  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [debtsRes, summaryRes] = await Promise.all([
          fetch("/api/debts"),
          fetch("/api/debts/summary"),
        ]);
        const [debtsJson, summaryJson] = await Promise.all([
          debtsRes.json(),
          summaryRes.json(),
        ]);
        if (!cancelled) {
          setDebts(debtsJson.data ?? []);
          setSummary(summaryJson.data ?? null);
        }
      } catch {
        if (!cancelled) console.error("Error fetching debts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Auto-fetch projection when strategy or payment changes and a debt is selected
  useEffect(() => {
    if (!selectedDebtId || !monthlyPayment) return;
    let cancelled = false;
    async function load() {
      try {
        const payment = parseFloat(monthlyPayment);
        if (isNaN(payment) || payment <= 0) return;
        const res = await fetch(
          `/api/debts/${selectedDebtId}/projection?monthlyPayment=${payment}&strategy=${strategy}`,
        );
        const json = await res.json();
        if (!cancelled) setProjection(json.data ?? null);
      } catch {
        if (!cancelled) console.error("Error fetching projection");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedDebtId, monthlyPayment, strategy]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deudas"
        description="Gestiona y proyecta el pago de tus deudas"
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : (
        <>
          <DebtSummaryCard summary={summary} />

          {debts.length > 0 && (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="monthlyPayment" className="text-sm font-medium">
                    Pago mensual
                  </Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    placeholder="100000"
                    className="mt-1 max-w-xs"
                  />
                </div>
                <PayoffStrategyToggle value={strategy} onChange={setStrategy} />
              </div>

              <DebtTable debts={debts} onSelectDebt={(d) => setSelectedDebtId(d.id)} />

              {projection && (
                <PayoffSchedule
                  months={projection.schedule}
                  totalInterest={projection.totalInterest}
                  payoffMonths={projection.payoffMonths}
                  monthlyInterestWarning={projection.monthlyInterestWarning}
                />
              )}
            </>
          )}

          {debts.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No tienes cuentas de deuda. Crea una cuenta de tipo tarjeta de crédito o préstamo.
            </div>
          )}
        </>
      )}
    </div>
  );
}
