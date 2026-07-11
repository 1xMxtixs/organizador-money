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

    const debts = accounts.map((a: { id: string; name: string; type: string; bankName: string | null; balance: unknown; interestRate: unknown; currencyCode: string }) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      bankName: a.bankName,
      balance: Number(a.balance),
      interestRate: a.interestRate ? Number(a.interestRate) : 0,
      currencyCode: a.currencyCode,
      isPaidOff: Number(a.balance) <= 0,
    }));

    return apiSuccess(debts);
  } catch {
    return apiError("Error al obtener deudas", 500);
  }
}
