import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateBudgetSchema } from "@/lib/validations/budget";
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
    const parsed = updateBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    // Check ownership
    const existing = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return apiError("Presupuesto no encontrado", 404);
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: parsed.data,
      include: {
        category: {
          select: { name: true, icon: true, color: true },
        },
      },
    });

    return apiSuccess(budget);
  } catch {
    return apiError("Error al actualizar presupuesto", 500);
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
    const existing = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return apiError("Presupuesto no encontrado", 404);
    }

    // Soft delete (the extension will handle setting deletedAt)
    await prisma.budget.delete({
      where: { id },
    });

    return apiSuccess({ message: "Presupuesto eliminado" });
  } catch {
    return apiError("Error al eliminar presupuesto", 500);
  }
}
