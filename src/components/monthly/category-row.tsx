"use client";

import { QuickEntryInput } from "./quick-entry-input";
import { formatCurrency } from "@/lib/utils";
import type { CategoryRowProps } from "@/types/monthly";

export function CategoryRow({ category, accountId, onQuickEntry }: CategoryRowProps) {
  const { name, icon, color, actual, budget } = category;
  const hasBudget = budget !== null;

  const progressPct = hasBudget
    ? Math.min(Math.round(budget!.percentage), 100)
    : 0;

  const barColor =
    !hasBudget
      ? "bg-muted-foreground/30"
      : budget!.status === "over"
        ? "bg-red-500"
        : budget!.status === "warning"
          ? "bg-yellow-500"
          : "bg-emerald-500";

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      {/* Category icon */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-sm"
        style={{ backgroundColor: color + "20", color }}
      >
        {icon}
      </div>

      {/* Name + progress bar */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{name}</p>
        {hasBudget && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground whitespace-nowrap">
              {budget!.percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Actual amount */}
      <span className="text-sm font-medium tabular-nums whitespace-nowrap">
        {formatCurrency(actual)}
      </span>

      {/* Quick entry */}
      <QuickEntryInput
        onSubmit={(amount) => onQuickEntry(category.categoryId, amount)}
        disabled={!accountId}
      />
    </div>
  );
}
