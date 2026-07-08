import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const userId = session.user.id;
    const now = new Date();
    const months: { month: string; balance: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const [incomeSum, expenseSum] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            account: { userId },
            type: "income",
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            account: { userId },
            type: "expense",
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
      ]);

      const income = Number(incomeSum._sum.amount ?? 0);
      const expenses = Number(expenseSum._sum.amount ?? 0);
      const balance = income - expenses;

      months.push({
        month: MONTH_NAMES[date.getMonth()],
        balance,
      });
    }

    return apiSuccess(months);
  } catch {
    return apiError("Error al obtener evolución", 500);
  }
}
