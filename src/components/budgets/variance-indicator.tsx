"use client";

import { cn } from "@/lib/utils";

interface VarianceIndicatorProps {
  variance: number;
  status: "under" | "on-target" | "over";
  className?: string;
}

export function VarianceIndicator({
  variance,
  status,
  className,
}: VarianceIndicatorProps) {
  const roundedVariance = Math.round(Math.abs(variance));
  const prefix = variance >= 0 ? "+" : "-";

  const colorClasses = {
    under: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    "on-target": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    over: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colorClasses[status],
        className
      )}
    >
      {prefix}{roundedVariance}%
    </span>
  );
}
