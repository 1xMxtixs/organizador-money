"use client";

import { CategoryRow } from "./category-row";
import type { CategoryActual } from "@/types/monthly";

interface IncomeSectionProps {
  categories: CategoryActual[];
  accountId: string;
  onQuickEntry: (categoryId: string, amount: number) => Promise<void>;
}

export function IncomeSection({ categories, accountId, onQuickEntry }: IncomeSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Ingresos</h3>
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.categoryId}
            category={cat}
            accountId={accountId}
            onQuickEntry={onQuickEntry}
          />
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sin categorías de ingreso
          </p>
        )}
      </div>
    </div>
  );
}
