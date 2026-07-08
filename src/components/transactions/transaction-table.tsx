import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TransactionType } from "@/lib/validations/transaction";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  account: { id: string; name: string };
  category?: { id: string; name: string; icon: string; color: string } | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onSelect?: (id: string) => void;
}

const typeLabels: Record<TransactionType, string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

const typeColors: Record<TransactionType, string> = {
  income: "bg-green-100 text-green-800",
  expense: "bg-red-100 text-red-800",
  transfer: "bg-blue-100 text-blue-800",
};

export function TransactionTable({ transactions, onSelect }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay transacciones para mostrar.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              className={onSelect ? "cursor-pointer" : ""}
              onClick={() => onSelect?.(tx.id)}
            >
              <TableCell className="text-sm">
                {new Date(tx.date).toLocaleDateString("es-CL")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{tx.description}</span>
                  <Badge variant="secondary" className={typeColors[tx.type]}>
                    {typeLabels[tx.type]}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {tx.category ? `${tx.category.icon} ${tx.category.name}` : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {tx.account.name}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`text-sm font-semibold ${
                    tx.amount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {formatCurrency(tx.amount)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
