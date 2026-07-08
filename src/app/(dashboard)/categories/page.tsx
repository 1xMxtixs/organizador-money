"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/categories/category-badge";
import { CategoryForm } from "@/components/categories/category-form";
import type { CategoryType } from "@/lib/validations/category";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
  sortOrder: number;
}

const typeTabs: { value: CategoryType | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "expense", label: "Gastos" },
  { value: "income", label: "Ingresos" },
  { value: "saving", label: "Ahorro" },
  { value: "investment", label: "Inversión" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<CategoryType | "all">("all");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (!cancelled) setCategories(json.data ?? []);
      } catch {
        if (!cancelled) console.error("Error fetching categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchCategories = async () => {
    const res = await fetch("/api/categories");
    const json = await res.json();
    setCategories(json.data ?? []);
  };

  const filtered = activeType === "all"
    ? categories
    : categories.filter((c) => c.type === activeType);

  const grouped = filtered.reduce<Record<string, Category[]>>((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setFormOpen(true)}>Nueva Categoría</Button>
      </div>

      <div className="flex gap-2">
        {typeTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeType === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveType(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">
          Cargando categorías...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No tienes categorías {activeType !== "all" ? "de este tipo" : "creadas"}.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, items]) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base capitalize">
                  {typeTabs.find((t) => t.value === type)?.label ?? type}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {items.map((cat) => (
                    <CategoryBadge key={cat.id} category={cat} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (data) => {
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error);
          }
          await refetchCategories();
        }}
        mode="create"
      />
    </div>
  );
}
