"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { DebtProgressBar } from "./debt-progress-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface DebtAccount {
  id: string;
  name: string;
  type: string;
  bankName: string | null;
  balance: number;
  interestRate: number;
  isPaidOff: boolean;
}

interface DebtTableProps {
  debts: DebtAccount[];
  onSelectDebt?: (debt: DebtAccount) => void;
}

const typeLabels: Record<string, string> = {
  credit_card: "Tarjeta de crédito",
  loan: "Préstamo",
};

export function DebtTable({ debts, onSelectDebt }: DebtTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<DebtAccount>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.bankName && (
              <div className="text-xs text-muted-foreground">{row.original.bankName}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => (
          <Badge variant="secondary">{typeLabels[row.original.type] ?? row.original.type}</Badge>
        ),
      },
      {
        accessorKey: "balance",
        header: "Saldo",
        cell: ({ row }) => (
          <span className={cn("font-medium", row.original.isPaidOff && "text-green-600")}>
            {formatCurrency(row.original.balance)}
          </span>
        ),
      },
      {
        accessorKey: "interestRate",
        header: "Tasa",
        cell: ({ row }) => <span>{row.original.interestRate}%</span>,
      },
      {
        id: "progress",
        header: "Progreso",
        cell: ({ row }) => (
          <DebtProgressBar
            balance={row.original.balance}
            originalBalance={row.original.balance}
          />
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: debts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none hover:bg-muted/50"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className="flex items-center gap-1"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {typeof header.column.columnDef.header === "string"
                        ? header.column.columnDef.header
                        : null}
                      {{
                        asc: <ChevronUp className="h-4 w-4" />,
                        desc: <ChevronDown className="h-4 w-4" />,
                      }[header.column.getIsSorted() as "asc" | "desc"] ?? null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground py-8"
              >
                No tienes deudas registradas
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  onSelectDebt && "cursor-pointer",
                )}
                onClick={() => onSelectDebt?.(row.original)}
              >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {typeof cell.column.columnDef.cell === "function"
                        ? (cell.column.columnDef.cell(cell.getContext() as never) as React.ReactNode)
                        : String(cell.getValue())}
                    </TableCell>
                  ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
