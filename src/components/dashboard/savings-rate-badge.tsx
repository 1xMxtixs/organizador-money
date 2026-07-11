"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SavingsRateBadgeProps {
  rate: number | null;
}

function getColor(rate: number | null): string {
  if (rate === null) return "text-muted-foreground";
  if (rate >= 20) return "text-green-600";
  if (rate >= 10) return "text-yellow-600";
  return "text-red-600";
}

function getBgColor(rate: number | null): string {
  if (rate === null) return "bg-muted";
  if (rate >= 20) return "bg-green-600/10";
  if (rate >= 10) return "bg-yellow-600/10";
  return "bg-red-600/10";
}

function getLabel(rate: number | null): string {
  if (rate === null) return "Sin ingresos";
  if (rate >= 20) return "Excelente";
  if (rate >= 10) return "Bueno";
  return "Mejorar";
}

export function SavingsRateBadge({ rate }: SavingsRateBadgeProps) {
  const color = getColor(rate);
  const bgColor = getBgColor(rate);
  const label = getLabel(rate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tasa de ahorro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              bgColor,
            )}
          >
            <span className={cn("text-xl font-bold tabular-nums", color)}>
              {rate !== null ? `${rate}%` : "—"}
            </span>
          </div>
          <div>
            <p className={cn("text-sm font-medium", color)}>{label}</p>
            <p className="text-xs text-muted-foreground">
              {rate !== null
                ? rate >= 20
                  ? "Por encima del 20% ideal"
                  : rate >= 10
                    ? "Dentro del rango aceptable"
                    : "Debajo del 10% recomendado"
                : "Registra ingresos para calcular"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
