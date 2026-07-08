import { create } from "zustand";
import type { CategoryType } from "@/lib/validations/category";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  cashflowDirection: "inflow" | "outflow";
  isDefault: boolean;
  sortOrder: number;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: (type?: CategoryType) => Promise<void>;
  createCategory: (data: Record<string, unknown>) => Promise<void>;
  updateCategory: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (type?: CategoryType) => {
    set({ loading: true, error: null });
    try {
      const params = type ? `?type=${type}` : "";
      const res = await fetch(`/api/categories${params}`);
      const json = await res.json();
      set({ categories: json.data ?? [], loading: false });
    } catch {
      set({ error: "Error al cargar categorías", loading: false });
    }
  },

  createCategory: async (data) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await get().fetchCategories();
  },

  updateCategory: async (id, data) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await get().fetchCategories();
  },

  deleteCategory: async (id) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    await get().fetchCategories();
  },
}));
