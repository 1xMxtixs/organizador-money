"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { MonthNavigatorProps } from "@/types/monthly";

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_NAMES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Locale-data-independent mapping. Avoids Intl/toLocaleDateString so the
// server (small-icu) and browser never diverge on the rendered month text.
function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES_ES[m - 1]} de ${y}`;
}

export function MonthNavigator({ currentMonth, onChange }: MonthNavigatorProps) {
  // During SSR and the client's first render the store month is "" (resolved
  // client-side after mount), so render a stable placeholder that matches on
  // both sides and avoids a hydration text mismatch.
  const label = currentMonth ? formatMonth(currentMonth) : "—";

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(shiftMonth(currentMonth, -1))}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <span className="text-lg font-semibold capitalize min-w-[160px] text-center">
        {label}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(shiftMonth(currentMonth, 1))}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}
