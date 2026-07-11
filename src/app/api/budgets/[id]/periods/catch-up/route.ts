import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { catchUpPeriods } from "@/lib/budget-period";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { id } = await params;

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

    // Catch up missing periods
    const periodsCreated = await catchUpPeriods(id);

    return apiSuccess({
      message: `Se crearon ${periodsCreated} períodos faltantes`,
      periodsCreated,
    });
  } catch {
    return apiError("Error al crear períodos faltantes", 500);
  }
}
