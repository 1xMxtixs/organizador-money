import type { Metadata } from "next";
import { Suspense } from "react";
import { MonthlyPageClient } from "@/components/monthly/monthly-page";

export const metadata: Metadata = {
  title: "Mensual — Finanzas",
};

export default function MonthlyPage() {
  return (
    <Suspense>
      <MonthlyPageClient />
    </Suspense>
  );
}
