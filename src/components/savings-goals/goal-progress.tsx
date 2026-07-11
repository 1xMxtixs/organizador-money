import { formatCurrency } from "@/lib/utils";

interface GoalProgressProps {
  saved: number;
  target: number;
  progressPercent: number;
  isCompleted: boolean;
}

export function GoalProgress({
  saved,
  target,
  progressPercent,
  isCompleted,
}: GoalProgressProps) {
  const barColor = isCompleted ? "bg-green-500" : "bg-blue-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">
          {formatCurrency(saved)} <span className="text-muted-foreground">de</span>{" "}
          {formatCurrency(target)}
        </span>
        <span className="text-muted-foreground font-medium">
          {Math.round(progressPercent)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${barColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
