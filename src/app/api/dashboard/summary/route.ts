import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [accounts, incomeSum, expenseSum] = await Promise.all([
      prisma.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true },
      }),
      prisma.transaction.aggregate({
        where: {
          account: { userId },
          type: "income",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          account: { userId },
          type: "expense",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalBalance = accounts.reduce(
      (sum: number, acc: { balance: unknown }) => sum + Number(acc.balance),
      0,
    );
    const monthlyIncome = Number(incomeSum._sum.amount ?? 0);
    const monthlyExpenses = Number(expenseSum._sum.amount ?? 0);
    const monthlySavings = monthlyIncome - monthlyExpenses;

    return apiSuccess({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
    });
  } catch {
    return apiError("Error al obtener resumen", 500);
  }
}
