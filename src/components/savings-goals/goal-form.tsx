"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  type CreateSavingsGoalInput,
  type UpdateSavingsGoalInput,
} from "@/lib/validations/savings-goal";

interface Account {
  id: string;
  name: string;
}

interface SavingsGoalData {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  deadline: string | null;
  account: { id: string; name: string };
}

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSavingsGoalInput | UpdateSavingsGoalInput) => Promise<void>;
  initialData?: SavingsGoalData;
  mode?: "create" | "edit";
}

export function GoalForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: GoalFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState(initialData?.name ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "🎯");
  const [targetAmount, setTargetAmount] = useState(
    initialData?.targetAmount?.toString() ?? ""
  );
  const [accountId, setAccountId] = useState(initialData?.account?.id ?? "");
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? initialData.deadline.split("T")[0] : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch("/api/accounts");
        const json = await res.json();
        setAccounts(json.data ?? []);
      } catch {
        console.error("Error fetching accounts");
      }
    }
    if (open) {
      loadAccounts();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setIcon(initialData?.icon ?? "🎯");
      setTargetAmount(initialData?.targetAmount?.toString() ?? "");
      setAccountId(initialData?.account?.id ?? "");
      setDeadline(
        initialData?.deadline ? initialData.deadline.split("T")[0] : ""
      );
      setErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const targetAmountNum = parseFloat(targetAmount);
    if (isNaN(targetAmountNum)) {
      setErrors({ targetAmount: "El monto debe ser un número válido" });
      return;
    }

    if (mode === "create") {
      const result = createSavingsGoalSchema.safeParse({
        name,
        icon,
        targetAmount: targetAmountNum,
        accountId,
        deadline: deadline || undefined,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        await onSubmit(result.data);
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    } else {
      const result = updateSavingsGoalSchema.safeParse({
        name,
        icon,
        targetAmount: targetAmountNum,
        deadline: deadline || undefined,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        await onSubmit(result.data);
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Meta de Ahorro" : "Editar Meta de Ahorro"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Vacaciones"
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icono</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🎯"
              maxLength={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Monto Meta</Label>
            <Input
              id="targetAmount"
              type="number"
              step="1"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Ej: 1000000"
            />
            {errors.targetAmount && (
              <p className="text-sm text-destructive">{errors.targetAmount}</p>
            )}
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-destructive">{errors.accountId}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deadline">Fecha límite (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Guardando..."
                : mode === "create"
                ? "Crear Meta"
                : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
