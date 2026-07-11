"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BudgetCategory {
  name: string;
  icon: string;
  color: string;
}

interface Budget {
  id: string;
  category: BudgetCategory;
}

interface BudgetDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  onConfirm: (budgetId: string) => Promise<void>;
}

export function BudgetDeleteDialog({
  open,
  onOpenChange,
  budget,
  onConfirm,
}: BudgetDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!budget) return;
    setLoading(true);
    try {
      await onConfirm(budget.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!budget) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Presupuesto</DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas eliminar el presupuesto de{" "}
            <span className="font-semibold">
              {budget.category.icon} {budget.category.name}
            </span>
            ? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
