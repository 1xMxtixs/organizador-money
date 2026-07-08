"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionType } from "@/lib/validations/transaction";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface TransactionFiltersProps {
  accounts: Account[];
  categories: Category[];
  filters: {
    from?: string;
    to?: string;
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
  };
  onChange: (filters: TransactionFiltersProps["filters"]) => void;
}

export function TransactionFilters({
  accounts,
  categories,
  filters,
  onChange,
}: TransactionFiltersProps) {
  const update = (key: string, value: string | null) => {
    onChange({ ...filters, [key]: value && value !== "__all__" ? value : undefined });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Desde</Label>
        <Input
          type="date"
          value={filters.from ?? ""}
          onChange={(e) => update("from", e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Hasta</Label>
        <Input
          type="date"
          value={filters.to ?? ""}
          onChange={(e) => update("to", e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Cuenta</Label>
        <Select
          value={filters.accountId ?? "__all__"}
          onValueChange={(v) => update("accountId", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Categoría</Label>
        <Select
          value={filters.categoryId ?? "__all__"}
          onValueChange={(v) => update("categoryId", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Select
          value={filters.type ?? "__all__"}
          onValueChange={(v) => update("type", v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            <SelectItem value="income">Ingreso</SelectItem>
            <SelectItem value="expense">Gasto</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
