import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ensurePeriodExists, computeAmountSpent } from "@/lib/budget-period";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    // Check budget ownership
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!budget) {
      return apiError("Presupuesto no encontrado", 404);
    }

    // Parse month parameter or use current date
    let targetDate = new Date();
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      if (year && month) {
        targetDate = new Date(year, month - 1, 1);
      }
    }

    // Ensure period exists
    const period = await ensurePeriodExists(id, targetDate);

    // Compute amount spent
    const amountSpent = await computeAmountSpent(id, period.id);

    const budgetLimit = Number(budget.amountLimit);
    const variance = budgetLimit > 0 ? ((amountSpent - budgetLimit) / budgetLimit) * 100 : 0;
    const variancePercent = Math.round(variance * 100) / 100;

    let status: "under" | "on-target" | "over" = "under";
    if (amountSpent > budgetLimit) {
      status = "over";
    } else if (Math.abs(variancePercent) < 1) {
      status = "on-target";
    }

    return apiSuccess({
      budgetLimit,
      amountSpent,
      variance: amountSpent - budgetLimit,
      variancePercent,
      status,
      period: {
        id: period.id,
        startsAt: period.startsAt,
        endsAt: period.endsAt,
      },
    });
  } catch {
    return apiError("Error al obtener comparación presupuesto vs real", 500);
  }
}
