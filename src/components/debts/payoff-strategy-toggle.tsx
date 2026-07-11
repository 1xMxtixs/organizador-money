"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PayoffStrategy } from "@/lib/debt-projection";

interface PayoffStrategyToggleProps {
  value: PayoffStrategy;
  onChange: (strategy: PayoffStrategy) => void;
}

const strategies = [
  {
    value: "snowball" as const,
    label: "Bola de nieve",
    description: "Menor saldo primero",
  },
  {
    value: "avalanche" as const,
    label: "Avalancha",
    description: "Mayor tasa primero",
  },
];

export function PayoffStrategyToggle({ value, onChange }: PayoffStrategyToggleProps) {
  return (
    <div className="flex gap-2">
      {strategies.map((s) => (
        <Button
          key={s.value}
          variant={value === s.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(s.value)}
          className={cn("flex-col h-auto py-2", value === s.value && "ring-2 ring-primary")}
        >
          <span className="text-sm font-medium">{s.label}</span>
          <span className="text-xs text-muted-foreground">{s.description}</span>
        </Button>
      ))}
    </div>
  );
}
