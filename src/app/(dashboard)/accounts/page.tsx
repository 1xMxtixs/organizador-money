import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cuentas — Finanzas",
};

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cuentas</h1>
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Lista de cuentas bancarias — próximamente
      </div>
    </div>
  );
}
