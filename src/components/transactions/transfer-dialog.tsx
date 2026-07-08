"use client";

import { useState } from "react";
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

interface Account {
  id: string;
  name: string;
}

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    accountId: string;
    toAccountId: string;
    amount: number;
    description: string;
    date: string;
  }) => Promise<void>;
  accounts: Account[];
}

export function TransferDialog({
  open,
  onOpenChange,
  onSubmit,
  accounts,
}: TransferDialogProps) {
  const today = new Date().toISOString().split("T")[0];

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Transferencia");
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!fromAccountId) newErrors.fromAccountId = "Seleccioná la cuenta origen";
    if (!toAccountId) newErrors.toAccountId = "Seleccioná la cuenta destino";
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      newErrors.toAccountId = "No se puede transferir a la misma cuenta";
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = "El monto debe ser un número positivo";
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        accountId: fromAccountId,
        toAccountId,
        amount: amountNum,
        description: description.trim(),
        date: new Date(date).toISOString(),
      });
      onOpenChange(false);
      // Reset form
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setDescription("Transferencia");
      setDate(today);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir entre Cuentas</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cuenta Origen</Label>
            <Select value={fromAccountId} onValueChange={(v) => setFromAccountId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Desde..." />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fromAccountId && (
              <p className="text-sm text-destructive">{errors.fromAccountId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cuenta Destino</Label>
            <Select value={toAccountId} onValueChange={(v) => setToAccountId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Hacia..." />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  .filter((a) => a.id !== fromAccountId)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.toAccountId && (
              <p className="text-sm text-destructive">{errors.toAccountId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Transferir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
