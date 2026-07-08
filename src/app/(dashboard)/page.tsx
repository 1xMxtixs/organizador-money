import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Finanzas",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Dashboard con gráficos y resumen — próximamente
      </div>
    </div>
  );
}
