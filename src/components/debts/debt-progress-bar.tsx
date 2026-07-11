"use client";

interface DebtProgressBarProps {
  balance: number;
  originalBalance: number;
}

export function DebtProgressBar({ balance, originalBalance }: DebtProgressBarProps) {
  const paid = originalBalance - balance;
  const percent = originalBalance > 0 ? Math.min(100, (paid / originalBalance) * 100) : 100;
  const isPaidOff = balance <= 0;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {isPaidOff ? "Pagado" : `${Math.round(percent)}% pagado`}
        </span>
        {!isPaidOff && (
          <span className="text-muted-foreground">
            Restante
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
