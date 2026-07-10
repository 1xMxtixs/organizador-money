"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransferDialog } from "@/components/transactions/transfer-dialog";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  TransactionType,
  CreateTransactionInput,
} from "@/lib/validations/transaction";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  account: { id: string; name: string };
  category?: { id: string; name: string; icon: string; color: string } | null;
}

interface Filters {
  from?: string;
  to?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
}

function TransactionsSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="text-sm">
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-5 w-[60px] rounded-full" />
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-[70px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTransactions = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.accountId) params.set("accountId", filters.accountId);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.type) params.set("type", filters.type);
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();
      const items = json.data?.items ?? [];

      if (cursor) {
        setTransactions((prev) => [...prev, ...items]);
      } else {
        setTransactions(items);
      }

      setNextCursor(json.data?.nextCursor ?? null);
      setHasMore(json.data?.hasMore ?? false);
    },
    [filters],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        await Promise.all([
          fetchTransactions(),
          fetch("/api/accounts")
            .then((r) => r.json())
            .then((j) => {
              if (!cancelled) setAccounts(j.data ?? []);
            }),
          fetch("/api/categories")
            .then((r) => r.json())
            .then((j) => {
              if (!cancelled) setCategories(j.data ?? []);
            })
            .catch(() => {}),
        ]);
      } catch {
        if (!cancelled) console.error("Error loading transactions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchTransactions]);

  const handleCreateTransaction = async (data: CreateTransactionInput) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await fetchTransactions();
  };

  const handleCreateTransfer = async (data: {
    accountId: string;
    toAccountId: string;
    amount: number;
    description: string;
    date: string;
  }) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: "transfer" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await fetchTransactions();
  };

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      await fetchTransactions(nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transacciones</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transacciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransferOpen(true)}>
            Transferir
          </Button>
          <Button onClick={() => setFormOpen(true)}>Nueva Transacción</Button>
        </div>
      </div>

      <TransactionFilters
        accounts={accounts}
        categories={categories}
        filters={filters}
        onChange={setFilters}
      />

      {loading ? (
        <TransactionsSkeleton />
      ) : (
        <>
          <TransactionTable transactions={transactions} />
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Cargando..." : "Cargar más"}
              </Button>
            </div>
          )}
        </>
      )}

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateTransaction}
        accounts={accounts}
        categories={categories}
        mode="create"
      />

      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onSubmit={handleCreateTransfer}
        accounts={accounts}
      />
    </div>
  );
}