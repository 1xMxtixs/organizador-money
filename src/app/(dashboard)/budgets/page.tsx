"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetForm } from "@/components/budgets/budget-form";
import { BudgetDeleteDialog } from "@/components/budgets/budget-delete-dialog";
import { PageHeader } from "@/components/layout/page-header";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/lib/validations/budget";

interface BudgetCategory {
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface BudgetCurrentPeriod {
  amountSpent: number;
  variance: number;
  status: "under" | "on-target" | "over";
}

interface Budget {
  id: string;
  categoryId: string;
  category: BudgetCategory;
  amountLimit: number;
  period: "monthly" | "weekly" | "yearly";
  isActive: boolean;
  note?: string | null;
  currentPeriod: BudgetCurrentPeriod | null;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/budgets");
        const json = await res.json();
        if (!cancelled) setBudgets(json.data ?? []);
      } catch {
        if (!cancelled) console.error("Error fetching budgets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchBudgets = async () => {
    const res = await fetch("/api/budgets");
    const json = await res.json();
    setBudgets(json.data ?? []);
  };

  const handleCreate = async (data: CreateBudgetInput) => {
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    await refetchBudgets();
  };

  const handleEdit = async (data: UpdateBudgetInput) => {
    if (!selectedBudget) return;
    const res = await fetch(`/api/budgets/${selectedBudget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    await refetchBudgets();
  };

  const handleFormSubmit = async (data: CreateBudgetInput | UpdateBudgetInput) => {
    if (formMode === "create") {
      await handleCreate(data as CreateBudgetInput);
    } else {
      await handleEdit(data as UpdateBudgetInput);
    }
  };

  const handleDelete = async (budgetId: string) => {
    const res = await fetch(`/api/budgets/${budgetId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    await refetchBudgets();
  };

  const openCreateForm = () => {
    setSelectedBudget(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEditForm = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormMode("edit");
    setFormOpen(true);
  };

  const openDeleteDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description="Gestiona tus presupuestos por categoría"
      >
        <Button onClick={openCreateForm}>Nuevo Presupuesto</Button>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No tienes presupuestos creados. Crea uno para empezar a controlar tus gastos.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={openEditForm}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedBudget as any}
        mode={formMode}
      />

      <BudgetDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        budget={selectedBudget}
        onConfirm={handleDelete}
      />
    </div>
  );
}
