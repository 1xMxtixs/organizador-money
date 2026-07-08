import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateCategorySchema } from "@/lib/validations/category";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!category) {
      return apiError("Categoría no encontrada", 404);
    }

    return apiSuccess(category);
  } catch {
    return apiError("Error al obtener categoría", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!category) {
      return apiError("Categoría no encontrada", 404);
    }

    if (category.isDefault) {
      return apiError("No se pueden editar categorías predefinidas", 403);
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    if (parsed.data.name && parsed.data.type) {
      const duplicate = await prisma.category.findFirst({
        where: {
          userId: session.user.id,
          name: parsed.data.name,
          type: parsed.data.type,
          id: { not: id },
          deletedAt: null,
        },
      });
      if (duplicate) {
        return apiError("Ya existe una categoría con ese nombre", 409);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Error al actualizar categoría", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!category) {
      return apiError("Categoría no encontrada", 404);
    }

    if (category.isDefault) {
      return apiError("No se pueden eliminar categorías predefinidas", 403);
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return apiSuccess({ message: "Categoría eliminada" });
  } catch {
    return apiError("Error al eliminar categoría", 500);
  }
}
