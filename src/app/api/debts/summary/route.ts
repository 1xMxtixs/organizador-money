import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { AccountType } from "@/generated/prisma/client";

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
        balance: true,
        interestRate: true,
      },
    });

    const totalDebt = accounts.reduce(
      (sum: number, a: { balance: unknown }) => sum + Math.max(0, Number(a.balance)),
      0,
    );
    const activeDebts = accounts.filter((a: { balance: unknown }) => Number(a.balance) > 0);
    const count = activeDebts.length;
    const avgInterestRate =
      count > 0
        ? activeDebts.reduce((sum: number, a: { interestRate: unknown }) => sum + Number(a.interestRate ?? 0), 0) /
          count
        : 0;

    return apiSuccess({
      totalDebt,
      count,
      avgInterestRate: Math.round(avgInterestRate * 100) / 100,
    });
  } catch {
    return apiError("Error al obtener resumen de deudas", 500);
  }
}
