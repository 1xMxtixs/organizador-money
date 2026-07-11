import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { AccountType } from "@/generated/prisma/client";
import { calculateSingleDebtProjection } from "@/lib/debt-projection";

const DEBT_TYPES: AccountType[] = ["credit_card", "loan"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        type: { in: DEBT_TYPES },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        bankName: true,
        balance: true,
        interestRate: true,
        currencyCode: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const debts = accounts.map((a: { id: string; name: string; type: string; bankName: string | null; balance: unknown; interestRate: unknown; currencyCode: string }) => {
      const balance = Number(a.balance);
      const interestRate = a.interestRate ? Number(a.interestRate) : 0;

      // Default monthly payment: 2% of balance
      const minimumPayment = Math.max(0, balance * 0.02);

      // Compute projected payoff date
      let projectedPayoffDate: string | null = null;
      if (balance > 0 && minimumPayment > 0) {
        const projection = calculateSingleDebtProjection(balance, interestRate, minimumPayment);
        const payoffMonths = projection.payoffDate;
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + payoffMonths);
        projectedPayoffDate = payoffDate.toISOString();
      }

      return {
        id: a.id,
        name: a.name,
        type: a.type,
        bankName: a.bankName,
        balance,
        interestRate,
        currencyCode: a.currencyCode,
        isPaidOff: balance <= 0,
        minimumPayment,
        paidAmount: 0,
        remainingPercent: balance > 0 ? 100 : 0,
        projectedPayoffDate,
      };
    });

    return apiSuccess(debts);
  } catch {
    return apiError("Error al obtener deudas", 500);
  }
}
