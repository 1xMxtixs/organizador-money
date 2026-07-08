import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

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

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}
