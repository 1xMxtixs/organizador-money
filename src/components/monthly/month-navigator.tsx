"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { MonthNavigatorProps } from "@/types/monthly";

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1);
  return d.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

export function MonthNavigator({ currentMonth, onChange }: MonthNavigatorProps) {
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
        {formatMonth(currentMonth)}
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
