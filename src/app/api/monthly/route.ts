import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { monthParamSchema } from "@/lib/validations/monthly";
import { apiSuccess, apiError } from "@/lib/api-response";

function getMonthBounds(month: string) {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 0, 23, 59, 59, 999);
  return { start, end };
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("month");
  const parsed = monthParamSchema.safeParse(raw);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400);
  }

  const month = parsed.data ?? currentMonth();
  const userId = session.user.id;
  const { start, end } = getMonthBounds(month);

  try {
    const [incomeAgg, expenseAgg, expenseByCategory, categories, budgets, recentTx, defaultAccount] =
      await Promise.all([
        // Total income this month
        prisma.transaction.aggregate({
          where: {
            account: { userId },
            type: "income",
            date: { gte: start, lte: end },
            deletedAt: null,
          },
          _sum: { amount: true },
        }),
        // Total expenses this month
        prisma.transaction.aggregate({
          where: {
            account: { userId },
            type: "expense",
            date: { gte: start, lte: end },
            deletedAt: null,
          },
          _sum: { amount: true },
        }),
        // Expense actuals per category
        prisma.transaction.groupBy({
          by: ["categoryId"],
          where: {
            account: { userId },
            type: "expense",
            date: { gte: start, lte: end },
            deletedAt: null,
          },
          _sum: { amount: true },
        }),
        // All user categories (expense + income)
        prisma.category.findMany({
          where: { userId, type: { in: ["income", "expense"] } },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        }),
        // Active budgets
        prisma.budget.findMany({
          where: { userId, isActive: true },
          select: { categoryId: true, id: true, amountLimit: true },
        }),
        // Last 20 transactions
        prisma.transaction.findMany({
          where: {
            account: { userId },
            date: { gte: start, lte: end },
          },
          include: {
            category: { select: { name: true, icon: true, color: true } },
            account: { select: { name: true } },
          },
          orderBy: { date: "desc" },
          take: 20,
        }),
        // First active account (for quick entry default)
        prisma.account.findFirst({
          where: { userId, isActive: true },
          select: { id: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // Merge: categories × actuals × budgets
    const expenseByCategoryMap = new Map<string, number>(
      expenseByCategory
        .filter((e: { categoryId: string | null }) => e.categoryId)
        .map((e: { categoryId: string | null; _sum: { amount: unknown } }) => [
          e.categoryId!,
          Number(e._sum.amount ?? 0),
        ]),
    );
    const budgetMap = new Map<string, { categoryId: string; id: string; amountLimit: unknown }>(
      budgets.map((b: { categoryId: string; id: string; amountLimit: unknown }) => [b.categoryId, b]),
    );

    const categoryActuals = categories.map(
      (cat: { id: string; name: string; icon: string; color: string; type: string }) => {
        const actual = expenseByCategoryMap.get(cat.id) ?? 0;
        const budget = budgetMap.get(cat.id);
        let budgetInfo = null;
        if (budget) {
          const limit = Number(budget.amountLimit);
          const pct = limit > 0 ? Math.round((actual / limit) * 10000) / 100 : 0;
          const status = pct > 100 ? "over" : pct >= 80 ? "warning" : "under";
          budgetInfo = { budgetId: budget.id, amountLimit: limit, percentage: pct, status };
        }
        return {
          categoryId: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.type,
          actual,
          budget: budgetInfo,
        };
      },
    );

    // Summary
    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpenses = Math.abs(Number(expenseAgg._sum.amount ?? 0));
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0
      ? Math.round((balance / totalIncome) * 10000) / 100
      : null;

    return apiSuccess({
      summary: { totalIncome, totalExpenses, balance, savingsRate },
      categories: categoryActuals,
      transactions: recentTx,
      defaultAccountId: defaultAccount?.id ?? null,
    });
  } catch {
    return apiError("Error al obtener datos mensuales", 500);
  }
}
