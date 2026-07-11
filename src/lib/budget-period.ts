import { prisma } from "@/lib/prisma";
import { BudgetPeriodType } from "@/lib/validations/budget";

/**
 * Calculate period start and end dates based on period type and reference date.
 */
function getPeriodDates(
  period: BudgetPeriodType,
  date: Date
): { startsAt: Date; endsAt: Date } {
  const d = new Date(date);

  switch (period) {
    case "monthly": {
      const startsAt = new Date(d.getFullYear(), d.getMonth(), 1);
      const endsAt = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      return { startsAt, endsAt };
    }
    case "weekly": {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
      const startsAt = new Date(d.setDate(diff));
      startsAt.setHours(0, 0, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setDate(endsAt.getDate() + 6);
      endsAt.setHours(23, 59, 59);
      return { startsAt, endsAt };
    }
    case "yearly": {
      const startsAt = new Date(d.getFullYear(), 0, 1);
      const endsAt = new Date(d.getFullYear(), 11, 31, 23, 59, 59);
      return { startsAt, endsAt };
    }
  }
}

/**
 * Ensure a BudgetPeriod exists for the given budget and date.
 * Creates one if it doesn't exist.
 * Returns the period (existing or newly created).
 */
export async function ensurePeriodExists(budgetId: string, date: Date) {
  // Get the budget to know the period type
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    select: { period: true },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  const { startsAt, endsAt } = getPeriodDates(budget.period, date);

  // Check if period already exists
  const existing = await prisma.budgetPeriod.findFirst({
    where: {
      budgetId,
      startsAt,
      endsAt,
    },
  });

  if (existing) {
    return existing;
  }

  // Create new period
  return prisma.budgetPeriod.create({
    data: {
      budgetId,
      startsAt,
      endsAt,
    },
  });
}

/**
 * Compute the amount spent for a budget period by summing transactions.
 * Returns the total spent amount.
 */
export async function computeAmountSpent(
  budgetId: string,
  periodId: string
): Promise<number> {
  // Get the period dates
  const period = await prisma.budgetPeriod.findUnique({
    where: { id: periodId },
    select: { startsAt: true, endsAt: true },
  });

  if (!period) {
    throw new Error("Budget period not found");
  }

  // Get the budget's category
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    select: { categoryId: true },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  // Sum transactions for this category in the period date range
  const result = await prisma.transaction.aggregate({
    where: {
      categoryId: budget.categoryId,
      date: {
        gte: period.startsAt,
        lte: period.endsAt,
      },
      type: "expense",
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
  });

  return Number(result._sum.amount || 0);
}

/**
 * Create all missing periods from budget creation date to now.
 * Returns the number of periods created.
 */
export async function catchUpPeriods(budgetId: string): Promise<number> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    select: { period: true, createdAt: true },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  const now = new Date();
  const startDate = new Date(budget.createdAt);
  let periodsCreated = 0;

  // Generate all period dates from budget creation to now
  let currentDate = new Date(startDate);
  while (currentDate <= now) {
    const { startsAt, endsAt } = getPeriodDates(budget.period, currentDate);

    // Check if period already exists
    const existing = await prisma.budgetPeriod.findFirst({
      where: {
        budgetId,
        startsAt,
        endsAt,
      },
    });

    if (!existing) {
      await prisma.budgetPeriod.create({
        data: {
          budgetId,
          startsAt,
          endsAt,
        },
      });
      periodsCreated++;
    }

    // Move to next period
    switch (budget.period) {
      case "monthly":
        currentDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        );
        break;
      case "weekly":
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "yearly":
        currentDate = new Date(currentDate.getFullYear() + 1, 0, 1);
        break;
    }
  }

  return periodsCreated;
}
