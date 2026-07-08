import { create } from "zustand";
import type { AccountType } from "@/lib/validations/account";

interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string | null;
  balance?: number;
  currencyCode: string;
  createdAt: string;
}

interface AccountState {
  accounts: Account[];
  selected: Account | null;
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  selectAccount: (id: string) => Promise<void>;
  clearSelection: () => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  selected: null,
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      set({ accounts: json.data ?? [], loading: false });
    } catch {
      set({ error: "Error al cargar cuentas", loading: false });
    }
  },

  selectAccount: async (id: string) => {
    const cached = get().accounts.find((a) => a.id === id);
    if (cached) {
      set({ selected: cached });
      return;
    }

    try {
      const res = await fetch(`/api/accounts/${id}`);
      const json = await res.json();
      set({ selected: json.data ?? null });
    } catch {
      set({ error: "Error al cargar cuenta" });
    }
  },

  clearSelection: () => set({ selected: null }),
}));
