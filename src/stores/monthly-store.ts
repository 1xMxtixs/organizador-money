import { create } from "zustand";
import type { MonthlyData } from "@/types/monthly";

interface MonthlyState {
  month: string;
  data: MonthlyData | null;
  loading: boolean;
  error: string | null;

  setMonth: (month: string) => void;
  fetchData: () => Promise<void>;
  optimisticQuickEntry: (categoryId: string, amount: number) => void;
  revertOptimistic: (previousData: MonthlyData) => void;
}

export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const useMonthlyStore = create<MonthlyState>((set, get) => ({
  // Start empty so SSR and the client's first render produce identical markup.
  // The real month is resolved client-side only (see monthly-page effect),
  // avoiding a server/client timezone "month boundary" mismatch on hydration.
  month: "",
  data: null,
  loading: false,
  error: null,

  setMonth: (month) => {
    set({ month, data: null, error: null });
    get().fetchData();
  },

  fetchData: async () => {
    const { month } = get();
    set({ loading: true, error: null });

    try {
      const res = await fetch(`/api/monthly?month=${month}`);
      const json = await res.json();

      if (!res.ok) {
        set({ error: json.error ?? "Error al cargar datos", loading: false });
        return;
      }

      set({ data: json.data, loading: false });
    } catch {
      set({ error: "Error de red", loading: false });
    }
  },

  optimisticQuickEntry: (categoryId, amount) => {
    const { data } = get();
    if (!data) return;

    const categories = data.categories.map((cat) =>
      cat.categoryId === categoryId
        ? { ...cat, actual: cat.actual + amount }
        : cat,
    );

    const totalExpenses = categories
      .filter((c) => c.type === "expense")
      .reduce((sum, c) => sum + c.actual, 0);

    const totalIncome = categories
      .filter((c) => c.type === "income")
      .reduce((sum, c) => sum + c.actual, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0
      ? Math.round((balance / totalIncome) * 10000) / 100
      : null;

    set({
      data: {
        ...data,
        categories,
        summary: { totalIncome, totalExpenses, balance, savingsRate },
      },
    });
  },

  revertOptimistic: (previousData) => {
    set({ data: previousData });
  },
}));
