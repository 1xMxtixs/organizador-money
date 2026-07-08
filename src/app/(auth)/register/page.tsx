import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta — Finanzas",
};

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Crear Cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Registrate para empezar a organizar tus finanzas
        </p>
      </div>
      {/* Register form will be implemented in PR 3 (Auth) */}
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Formulario de registro — próximamente
      </div>
    </div>
  );
}
