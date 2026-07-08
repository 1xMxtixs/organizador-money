"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTypeBadge } from "@/components/accounts/account-type-badge";
import { AccountForm } from "@/components/accounts/account-form";
import { formatCurrency } from "@/lib/utils";
import type { AccountType, UpdateAccountInput } from "@/lib/validations/account";

interface AccountDetail {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string | null;
  balance?: number;
  currencyCode: string;
  createdAt: string;
  transactions?: Array<{
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
  }>;
}

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/accounts/${params.id}`);
        const json = await res.json();
        if (!cancelled) setAccount(json.data ?? null);
      } catch {
        if (!cancelled) console.error("Error fetching account");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const refetchAccount = async () => {
    const res = await fetch(`/api/accounts/${params.id}`);
    const json = await res.json();
    setAccount(json.data ?? null);
  };

  const handleUpdate = async (data: UpdateAccountInput) => {
    const res = await fetch(`/api/accounts/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await refetchAccount();
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return;

    const res = await fetch(`/api/accounts/${params.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/accounts");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Cargando cuenta...
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Cuenta no encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{account.name}</h1>
            <AccountTypeBadge type={account.type} />
          </div>
          {account.bankName && (
            <p className="text-sm text-muted-foreground">{account.bankName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Saldo Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {formatCurrency(account.balance ?? 0, account.currencyCode)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {account.transactions && account.transactions.length > 0 ? (
            <div className="space-y-3">
              {account.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay transacciones recientes.
            </p>
          )}
        </CardContent>
      </Card>

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleUpdate}
        initialData={{
          name: account.name,
          type: account.type,
          bankName: account.bankName ?? undefined,
        }}
        mode="edit"
      />
    </div>
  );
}
