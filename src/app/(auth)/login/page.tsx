import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión — Finanzas",
};

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Iniciar Sesión
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresá tus credenciales para acceder
        </p>
      </div>
      {/* Login form will be implemented in PR 3 (Auth) */}
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Formulario de login — próximamente
      </div>
    </div>
  );
}
