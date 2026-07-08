"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/accounts/account-card";
import { AccountForm } from "@/components/accounts/account-form";
import { formatCurrency } from "@/lib/utils";
import type {
  AccountType,
  CreateAccountInput,
} from "@/lib/validations/account";

interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string | null;
  balance?: number;
  currencyCode: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/accounts");
        const json = await res.json();
        if (!cancelled) setAccounts(json.data ?? []);
      } catch {
        if (!cancelled) console.error("Error fetching accounts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchAccounts = async () => {
    const res = await fetch("/api/accounts");
    const json = await res.json();
    setAccounts(json.data ?? []);
  };

  const handleCreate = async (data: CreateAccountInput) => {
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await refetchAccounts();
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cuentas</h1>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalBalance)}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>Nueva Cuenta</Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">
          Cargando cuentas...
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No tienes cuentas creadas. ¡Crea una para comenzar!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        mode="create"
      />
    </div>
  );
}
