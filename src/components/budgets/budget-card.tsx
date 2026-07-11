"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VarianceIndicator } from "./variance-indicator";
import { formatCurrency } from "@/lib/utils";
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface BudgetCategory {
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface BudgetCurrentPeriod {
  amountSpent: number;
  variance: number;
  status: "under" | "on-target" | "over";
}

interface Budget {
  id: string;
  categoryId: string;
  category: BudgetCategory;
  amountLimit: number;
  period: "monthly" | "weekly" | "yearly";
  isActive: boolean;
  note?: string | null;
  currentPeriod: BudgetCurrentPeriod | null;
}

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const periodLabels = {
  monthly: "Mensual",
  weekly: "Semanal",
  yearly: "Anual",
};

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { category, amountLimit, currentPeriod, period } = budget;
  const amountSpent = currentPeriod?.amountSpent ?? 0;
  const variance = currentPeriod?.variance ?? 0;
  const status = currentPeriod?.status ?? "under";

  const progressPercent = Math.min((amountSpent / amountLimit) * 100, 100);
  const isOver = amountSpent > amountLimit;

  const progressBarColor = isOver
    ? "bg-red-500"
    : status === "on-target"
    ? "bg-yellow-500"
    : "bg-green-500";

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: category.color + "20", color: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <CardTitle className="text-base">{category.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {periodLabels[period]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(budget)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(budget)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold">{formatCurrency(amountSpent)}</span>
            <span className="text-muted-foreground"> / {formatCurrency(amountLimit)}</span>
          </div>
          {currentPeriod && <VarianceIndicator variance={variance} status={status} />}
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${progressBarColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {budget.note && (
          <p className="text-sm text-muted-foreground truncate">{budget.note}</p>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="mr-2 h-4 w-4" />
              Ocultar detalle
            </>
          ) : (
            <>
              <ChevronDownIcon className="mr-2 h-4 w-4" />
              Ver detalle
            </>
          )}
        </Button>

        {expanded && (
          <div className="pt-2 border-t space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Límite:</span>{" "}
                <span className="font-medium">{formatCurrency(amountLimit)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gastado:</span>{" "}
                <span className="font-medium">{formatCurrency(amountSpent)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Restante:</span>{" "}
                <span className="font-medium">
                  {formatCurrency(Math.max(0, amountLimit - amountSpent))}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>{" "}
                <span className="font-medium capitalize">
                  {status === "under" ? "Bajo" : status === "on-target" ? "En meta" : "Sobrepasado"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
