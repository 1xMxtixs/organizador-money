"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PayoffMonth {
  month: number;
  balance: number;
  interest: number;
  principal: number;
  totalPaid: number;
}

interface PayoffScheduleProps {
  months: PayoffMonth[];
  totalInterest: number;
  payoffMonths: number;
  monthlyInterestWarning: boolean;
}

export function PayoffSchedule({
  months,
  totalInterest,
  payoffMonths,
  monthlyInterestWarning,
}: PayoffScheduleProps) {
  const displayMonths = months.slice(0, 24); // Show first 2 years max

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Proyección de Pago</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {payoffMonths} meses
            </Badge>
            {monthlyInterestWarning && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Pago menor que intereses
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Total de intereses: {formatCurrency(totalInterest)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Mes</th>
                <th className="px-3 py-2 text-right font-medium">Capital</th>
                <th className="px-3 py-2 text-right font-medium">Intereses</th>
                <th className="px-3 py-2 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {displayMonths.map((m) => (
                <tr key={m.month} className="border-t">
                  <td className="px-3 py-2">{m.month}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(m.principal)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {formatCurrency(m.interest)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatCurrency(m.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {months.length > 24 && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Mostrando primeros 24 meses de {months.length} total
          </p>
        )}
      </CardContent>
    </Card>
  );
}
