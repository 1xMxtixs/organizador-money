"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GoalProgress } from "./goal-progress";
import { GoalCompleteButton } from "./goal-complete-button";
import { PencilIcon, TrashIcon } from "lucide-react";

interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  deadline: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  account: { id: string; name: string };
  progress: {
    saved: number;
    target: number;
    progressPercent: number;
  };
}

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
  onComplete: () => void;
}

// Deadlines are stored as UTC midnight of the intended calendar day.
// Compare local calendar days so the countdown is correct in any timezone.
function daysUntilDeadline(deadline: string): number {
  const d = new Date(deadline);
  const deadlineCal = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const now = new Date();
  const nowCal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((deadlineCal.getTime() - nowCal.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDeadline(deadline: string): string {
  const diffDays = daysUntilDeadline(deadline);

  if (diffDays < 0) return "Vencida";
  if (diffDays === 0) return "Vence hoy";
  if (diffDays === 1) return "Vence mañana";
  return `${diffDays} días restantes`;
}

function deadlineBadgeClass(deadline: string): string {
  const diffDays = daysUntilDeadline(deadline);

  if (diffDays < 0) return "bg-red-100 text-red-700";
  if (diffDays <= 7) return "bg-yellow-100 text-yellow-700";
  return "bg-blue-100 text-blue-700";
}

export function GoalCard({ goal, onEdit, onDelete, onComplete }: GoalCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {goal.icon}
            </div>
            <div>
              <h3 className="text-base font-semibold">{goal.name}</h3>
              <p className="text-sm text-muted-foreground">{goal.account.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(goal)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(goal)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <GoalProgress
          saved={goal.progress.saved}
          target={goal.progress.target}
          progressPercent={goal.progress.progressPercent}
          isCompleted={goal.isCompleted}
        />

        {goal.deadline && (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${deadlineBadgeClass(
              goal.deadline
            )}`}
          >
            {formatDeadline(goal.deadline)}
          </span>
        )}

        <div className="flex items-center gap-2 pt-1">
          <GoalCompleteButton
            goalId={goal.id}
            isCompleted={goal.isCompleted}
            onComplete={onComplete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
