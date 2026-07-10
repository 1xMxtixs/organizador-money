"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { transactionColumns, type Transaction } from "@/components/transactions/transaction-columns";

interface TransactionTableProps {
  transactions: Transaction[];
  onSelect?: (id: string) => void;
}

function isCellFunction(cell: unknown): cell is (info: { row: { original: Transaction } }) => React.ReactNode {
  return typeof cell === "function";
}

export function TransactionTable({ transactions, onSelect }: TransactionTableProps) {
  const columns = React.useMemo(
    () =>
      transactionColumns.map((col) => {
        const cellFn = col.cell;
        return {
          ...col,
          cell:
            isCellFunction(cellFn)
              ? (info: { row: { original: Transaction } }) => {
                  const originalCell = cellFn(info as never);
                  if (onSelect && typeof originalCell === "object" && originalCell !== null) {
                    return (
                      <div
                        className="cursor-pointer"
                        onClick={() => onSelect(info.row.original.id)}
                      >
                        {originalCell}
                      </div>
                    );
                  }
                  return originalCell;
                }
              : undefined,
        };
      }),
    [onSelect]
  );

  return <DataTable columns={columns} data={transactions} searchKey="description" searchPlaceholder="Buscar transacciones..." />;
}