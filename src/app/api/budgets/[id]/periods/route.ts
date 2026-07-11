import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ensurePeriodExists } from "@/lib/budget-period";

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

    // Ensure current period exists
    await ensurePeriodExists(id, targetDate);

    // Get all periods for this budget
    const periods = await prisma.budgetPeriod.findMany({
      where: { budgetId: id },
      orderBy: { startsAt: "desc" },
    });

    return apiSuccess(periods);
  } catch {
    return apiError("Error al obtener períodos", 500);
  }
}
