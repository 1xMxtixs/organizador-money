import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transacciones — Finanzas",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Transacciones</h1>
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Historial de transacciones — próximamente
      </div>
    </div>
  );
}
