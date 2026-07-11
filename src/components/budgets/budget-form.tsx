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
  createBudgetSchema,
  updateBudgetSchema,
  type BudgetPeriodType,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from "@/lib/validations/budget";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface Budget {
  id: string;
  categoryId: string;
  category: Category;
  amountLimit: number;
  period: BudgetPeriodType;
  note?: string | null;
  isActive?: boolean;
  currentPeriod?: {
    amountSpent: number;
    variance: number;
    status: "under" | "on-target" | "over";
  } | null;
}

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBudgetInput | UpdateBudgetInput) => Promise<void>;
  initialData?: Budget;
  mode?: "create" | "edit";
}

const periodOptions: { value: BudgetPeriodType; label: string }[] = [
  { value: "monthly", label: "Mensual" },
  { value: "weekly", label: "Semanal" },
  { value: "yearly", label: "Anual" },
];

export function BudgetForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: BudgetFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [amountLimit, setAmountLimit] = useState(
    initialData?.amountLimit?.toString() ?? ""
  );
  const [period, setPeriod] = useState<BudgetPeriodType>(
    initialData?.period ?? "monthly"
  );
  const [note, setNote] = useState(initialData?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        setCategories(json.data ?? []);
      } catch {
        console.error("Error fetching categories");
      }
    }
    if (open) {
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setCategoryId(initialData?.categoryId ?? "");
      setAmountLimit(initialData?.amountLimit?.toString() ?? "");
      setPeriod(initialData?.period ?? "monthly");
      setNote(initialData?.note ?? "");
      setErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const amountLimitNum = parseFloat(amountLimit);
    if (isNaN(amountLimitNum)) {
      setErrors({ amountLimit: "El monto debe ser un número válido" });
      return;
    }

    if (mode === "create") {
      const result = createBudgetSchema.safeParse({
        categoryId,
        amountLimit: amountLimitNum,
        period,
        note: note || undefined,
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
      const result = updateBudgetSchema.safeParse({
        amountLimit: amountLimitNum,
        period,
        note: note || undefined,
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
            {mode === "create" ? "Nuevo Presupuesto" : "Editar Presupuesto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amountLimit">Monto Límite</Label>
            <Input
              id="amountLimit"
              type="number"
              step="0.01"
              min="0"
              value={amountLimit}
              onChange={(e) => setAmountLimit(e.target.value)}
              placeholder="Ej: 500000"
            />
            {errors.amountLimit && (
              <p className="text-sm text-destructive">{errors.amountLimit}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as BudgetPeriodType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Presupuesto para supermercado"
              maxLength={500}
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
                ? "Crear Presupuesto"
                : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
