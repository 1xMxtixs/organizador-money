import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

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

    // Check ownership
    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Meta de ahorro no encontrada", 404);
    }

    // Always mark as completed (idempotent)
    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return apiSuccess({
      id: goal.id,
      isCompleted: goal.isCompleted,
      completedAt: goal.completedAt,
    });
  } catch {
    return apiError("Error al actualizar estado de meta", 500);
  }
}
