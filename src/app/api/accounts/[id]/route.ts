import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateAccountSchema } from "@/lib/validations/account";
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
    const account = await prisma.account.findFirst({
      where: { id, userId: session.user.id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!account) {
      return apiError("Cuenta no encontrada", 404);
    }

    return apiSuccess(account);
  } catch {
    return apiError("Error al obtener cuenta", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.account.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Cuenta no encontrada", 404);
    }

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await prisma.account.findFirst({
        where: { userId: session.user.id, name: parsed.data.name },
      });
      if (duplicate) {
        return apiError("Ya existe una cuenta con ese nombre", 409);
      }
    }

    const account = await prisma.account.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(account);
  } catch {
    return apiError("Error al actualizar cuenta", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const existing = await prisma.account.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Cuenta no encontrada", 404);
    }

    await prisma.account.delete({ where: { id } });

    return apiSuccess({ message: "Cuenta eliminada" });
  } catch {
    return apiError("Error al eliminar cuenta", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const existing = await prisma.account.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return apiError("Cuenta no encontrada", 404);
    }

    const account = await prisma.account.restore({ where: { id } });

    return apiSuccess(account);
  } catch {
    return apiError("Error al restaurar cuenta", 500);
  }
}
