"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, RotateCcwIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface GoalCompleteButtonProps {
  goalId: string;
  isCompleted: boolean;
  onComplete: () => void;
}

export function GoalCompleteButton({
  goalId,
  isCompleted,
  onComplete,
}: GoalCompleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/savings-goals/${goalId}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        onComplete();
        setConfirmOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={isCompleted ? "outline" : "default"}
        size="sm"
        className="gap-1.5"
        onClick={() => setConfirmOpen(true)}
      >
        {isCompleted ? (
          <>
            <RotateCcwIcon className="h-3.5 w-3.5" />
            Desmarcar
          </>
        ) : (
          <>
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Marcar completa
          </>
        )}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCompleted ? "Desmarcar meta" : "Marcar meta como completa"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isCompleted
              ? "¿Estás seguro de que quieres desmarcar esta meta? Se revertirá el estado de completado."
              : "¿Estás seguro de que quieres marcar esta meta como completa?"}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleToggle} disabled={loading}>
              {loading ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
