import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { calculatePayoffSchedule } from "@/lib/debt-projection";
import { AccountType } from "@/generated/prisma/client";

const DEBT_TYPES: AccountType[] = ["credit_card", "loan"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const monthlyPayment = parseFloat(searchParams.get("monthlyPayment") ?? "0");
    const strategy = (searchParams.get("strategy") ?? "snowball") as "snowball" | "avalanche";

    if (monthlyPayment <= 0) {
      return apiError("El pago mensual debe ser mayor a 0", 400);
    }

    // Fetch the specific debt account
    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: session.user.id,
        type: { in: DEBT_TYPES },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        balance: true,
        interestRate: true,
        type: true,
        bankName: true,
      },
    });

    if (!account) {
      return apiError("Cuenta de deuda no encontrada", 404);
    }

    // Fetch all debts for context
    const allDebts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        type: { in: DEBT_TYPES },
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        balance: true,
        interestRate: true,
        type: true,
        bankName: true,
      },
    });

    const debts = allDebts.map((d: { id: string; name: string; balance: unknown; interestRate: unknown; type: string; bankName: string | null }) => ({
      id: d.id,
      name: d.name,
      balance: Number(d.balance),
      interestRate: d.interestRate ? Number(d.interestRate) : 0,
      type: d.type,
      bankName: d.bankName,
    }));

    const result = calculatePayoffSchedule(debts, monthlyPayment, strategy);

    // Find the specific debt's payoff month
    const activeDebts = debts.filter((d: { balance: number }) => d.balance > 0);
    const sortedDebts = [...activeDebts].sort((a, b) =>
      strategy === "snowball" ? a.balance - b.balance : b.interestRate - a.interestRate,
    );
    const priorityIndex = sortedDebts.findIndex((d: { id: string }) => d.id === id);

    return apiSuccess({
      debtId: id,
      strategy,
      monthlyPayment,
      schedule: result.months.slice(0, 120), // Cap at 10 years for response
      totalInterest: result.totalInterest,
      totalPaid: result.totalPaid,
      payoffMonths: result.payoffDate,
      monthlyInterestWarning: result.monthlyInterestWarning,
    });
  } catch {
    return apiError("Error al calcular proyección", 500);
  }
}
