import { create } from "zustand";
import type { TransactionType } from "@/lib/validations/transaction";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  account: { id: string; name: string; currencyCode: string };
  category?: { id: string; name: string; icon: string; color: string } | null;
}

interface TransactionFilters {
  from?: string;
  to?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
}

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;

  fetchTransactions: (cursor?: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  createTransaction: (data: Record<string, unknown>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  restoreTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  filters: {},
  nextCursor: null,
  hasMore: false,
  loading: false,
  error: null,

  fetchTransactions: async (cursor?: string) => {
    const { filters } = get();
    set({ loading: true, error: null });

    try {
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

      set((state) => ({
        transactions: cursor
          ? [...state.transactions, ...items]
          : items,
        nextCursor: json.data?.nextCursor ?? null,
        hasMore: json.data?.hasMore ?? false,
        loading: false,
      }));
    } catch {
      set({ error: "Error al cargar transacciones", loading: false });
    }
  },

  setFilters: (filters) => {
    set({ filters, transactions: [], nextCursor: null, hasMore: false });
  },

  createTransaction: async (data) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await get().fetchTransactions();
  },

  deleteTransaction: async (id) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await get().fetchTransactions();
  },

  restoreTransaction: async (id) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "POST",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await get().fetchTransactions();
  },
}));
