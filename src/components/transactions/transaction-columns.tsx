import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import type { TransactionType } from "@/lib/validations/transaction";

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  account: { id: string; name: string };
  category?: { id: string; name: string; icon: string; color: string } | null;
}

const typeLabels: Record<TransactionType, string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

const typeColors: Record<TransactionType, string> = {
  income: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expense: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const amountColors = {
  positive: "text-green-600 dark:text-green-400",
  negative: "text-red-600 dark:text-red-400",
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      return date.toLocaleDateString("es-CL");
    },
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{row.original.description}</span>
        <Badge variant="secondary" className={typeColors[row.original.type]}>
          {typeLabels[row.original.type]}
        </Badge>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => {
      const cat = row.original.category;
      return cat ? (
        <span className="text-sm text-muted-foreground flex items-center gap-2">
          <span role="img" aria-label={cat.name}>
            {cat.icon}
          </span>
          {cat.name}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "account",
    header: "Cuenta",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.account.name}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = row.original.amount;
      return (
        <span
          className={`text-sm font-semibold text-right ${
            amount >= 0 ? amountColors.positive : amountColors.negative
          }`}
        >
          {amount >= 0 ? "+" : ""}
          {formatCurrency(amount)}
        </span>
      );
    },
    enableSorting: true,
  },
];