import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  totalBalance: number;
  previousBalance?: number;
}

export function BalanceCard({ totalBalance, previousBalance }: BalanceCardProps) {
  const trendValue =
    previousBalance !== undefined
      ? previousBalance !== 0
        ? ((totalBalance - previousBalance) / Math.abs(previousBalance)) * 100
        : 0
      : null;

  const trendIcon =
    trendValue === null
      ? <Minus className="h-4 w-4 text-muted-foreground" />
      : trendValue > 0
      ? <ChevronUp className="h-4 w-4 text-emerald-600" />
      : trendValue < 0
      ? <ChevronDown className="h-4 w-4 text-red-600" />
      : <Minus className="h-4 w-4 text-muted-foreground" />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Balance total
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p
          className={cn(
            "text-3xl font-bold",
            totalBalance >= 0 ? "text-emerald-600" : "text-red-600",
          )}
        >
          {formatCurrency(totalBalance)}
        </p>
        {trendValue !== null && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {trendIcon}
            <span
              className={cn(
                "font-medium",
                trendValue > 0 && "text-emerald-600",
                trendValue < 0 && "text-red-600",
              )}
            >
              {trendValue > 0 ? "+" : ""}{trendValue.toFixed(1)}%
            </span>
            <span>vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
