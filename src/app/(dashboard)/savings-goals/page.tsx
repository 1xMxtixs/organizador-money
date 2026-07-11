"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/savings-goals/goal-card";
import { GoalForm } from "@/components/savings-goals/goal-form";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils";
import type { CreateSavingsGoalInput, UpdateSavingsGoalInput } from "@/lib/validations/savings-goal";

interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  deadline: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  account: { id: string; name: string };
  progress: {
    saved: number;
    target: number;
    progressPercent: number;
  };
}

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/savings-goals");
        const json = await res.json();
        if (!cancelled) setGoals(json.data ?? []);
      } catch {
        if (!cancelled) console.error("Error fetching savings goals");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchGoals = async () => {
    const res = await fetch("/api/savings-goals");
    const json = await res.json();
    setGoals(json.data ?? []);
  };

  const handleCreate = async (data: CreateSavingsGoalInput) => {
    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    await refetchGoals();
  };

  const handleEdit = async (data: UpdateSavingsGoalInput) => {
    if (!selectedGoal) return;
    const res = await fetch(`/api/savings-goals/${selectedGoal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    await refetchGoals();
  };

  const handleFormSubmit = async (data: CreateSavingsGoalInput | UpdateSavingsGoalInput) => {
    if (formMode === "create") {
      await handleCreate(data as CreateSavingsGoalInput);
    } else {
      await handleEdit(data as UpdateSavingsGoalInput);
    }
  };

  const handleDelete = async (goalId: string) => {
    const res = await fetch(`/api/savings-goals/${goalId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    await refetchGoals();
  };

  const openCreateForm = () => {
    setSelectedGoal(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEditForm = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setFormMode("edit");
    setFormOpen(true);
  };

  // Summary stats
  const totalSaved = goals.reduce((sum, g) => sum + g.progress.saved, 0);
  const totalTargets = goals.reduce((sum, g) => sum + g.progress.target, 0);
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const completionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas de Ahorro"
        description="Define y alcanza tus objetivos de ahorro"
      >
        <Button onClick={openCreateForm}>Nueva Meta</Button>
      </PageHeader>

      {!loading && goals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Ahorrado</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSaved)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Metas</p>
            <p className="text-2xl font-bold">{formatCurrency(totalTargets)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Metas Completadas</p>
            <p className="text-2xl font-bold">
              {completedGoals} / {goals.length}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
            <p className="text-2xl font-bold">{completionRate}%</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No tienes metas de ahorro creadas. Crea una para empezar a ahorrar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEditForm}
              onDelete={(g) => handleDelete(g.id)}
              onComplete={refetchGoals}
            />
          ))}
        </div>
      )}

      <GoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedGoal as any}
        mode={formMode}
      />
    </div>
  );
}
