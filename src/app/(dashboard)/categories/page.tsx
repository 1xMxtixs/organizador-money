import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categorías — Finanzas",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Gestión de categorías — próximamente
      </div>
    </div>
  );
}
