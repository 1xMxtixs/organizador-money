import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateSavingsGoalSchema } from "@/lib/validations/savings-goal";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSavingsGoalSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    // Check ownership
    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Meta de ahorro no encontrada", 404);
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.deadline !== undefined) {
      updateData.deadline = updateData.deadline ? new Date(updateData.deadline as string) : null;
    }

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: updateData,
      include: {
        account: {
          select: { id: true, name: true },
        },
      },
    });

    // Compute progress
    const result = await prisma.transaction.aggregate({
      where: {
        accountId: goal.accountId,
        type: "income",
        date: { gte: goal.createdAt },
      },
      _sum: { amount: true },
    });

    const saved = Number(result._sum.amount ?? 0);
    const target = Number(goal.targetAmount);
    const progressPercent = target > 0 ? (saved / target) * 100 : 0;

    return apiSuccess({
      ...goal,
      targetAmount: target,
      progress: {
        saved,
        target,
        progressPercent: Math.round(progressPercent * 100) / 100,
      },
    });
  } catch {
    return apiError("Error al actualizar meta de ahorro", 500);
  }
}

export async function DELETE(
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

    await prisma.savingsGoal.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Error al eliminar meta de ahorro", 500);
  }
}
