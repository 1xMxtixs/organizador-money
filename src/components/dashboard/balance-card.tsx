import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  totalBalance: number;
}

export function BalanceCard({ totalBalance }: BalanceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          Balance total
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`text-3xl font-bold ${
            totalBalance >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {formatCurrency(totalBalance)}
        </p>
      </CardContent>
    </Card>
  );
}
