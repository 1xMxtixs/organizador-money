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
import {
  createAccountSchema,
  type AccountType,
  type CreateAccountInput,
} from "@/lib/validations/account";

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "checking", label: "Cuenta Corriente" },
  { value: "savings", label: "Ahorro" },
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "investment", label: "Inversión" },
  { value: "cash", label: "Efectivo" },
  { value: "loan", label: "Préstamo" },
  { value: "real_estate", label: "Inmueble" },
];

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAccountInput) => Promise<void>;
  initialData?: {
    name?: string;
    type?: AccountType;
    bankName?: string;
  };
  mode?: "create" | "edit";
}

export function AccountForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: AccountFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<AccountType>(
    initialData?.type ?? "checking",
  );
  const [bankName, setBankName] = useState(initialData?.bankName ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createAccountSchema.safeParse({ name, type, bankName });
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
      setName("");
      setType("checking");
      setBankName("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Cuenta" : "Editar Cuenta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Banco Nación"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Banco (opcional)</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ej: Banco de Chile"
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
              {mode === "create" ? "Crear Cuenta" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
