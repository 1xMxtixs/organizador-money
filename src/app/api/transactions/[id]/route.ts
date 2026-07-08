import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/validations/transaction";
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
    const transaction = await prisma.transaction.findFirst({
      where: { id, deletedAt: null } as never,
      include: {
        account: { select: { id: true, name: true, currencyCode: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    if (!transaction) {
      return apiError("Transacción no encontrada", 404);
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: transaction.accountId, userId: session.user.id },
    });
    if (!account) {
      return apiError("Transacción no encontrada", 404);
    }

    return apiSuccess(transaction);
  } catch {
    return apiError("Error al obtener transacción", 500);
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
    const parsed = updateTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, deletedAt: null } as never,
    });

    if (!existing) {
      return apiError("Transacción no encontrada", 404);
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: existing.accountId, userId: session.user.id },
    });
    if (!account) {
      return apiError("Transacción no encontrada", 404);
    }

    const oldAmount = Number(existing.amount);
    const newAmount = parsed.data.amount
      ? parsed.data.type === "expense"
        ? -Math.abs(parsed.data.amount)
        : Math.abs(parsed.data.amount)
      : oldAmount;
    const amountDiff = newAmount - oldAmount;

    const transaction = await prisma.$transaction([
      prisma.transaction.update({
        where: { id },
        data: {
          ...parsed.data,
          ...(parsed.data.amount !== undefined ? { amount: newAmount } : {}),
          ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
        },
      }),
      // Adjust balance if amount changed
      ...(amountDiff !== 0
        ? [
            prisma.account.update({
              where: { id: existing.accountId },
              data: { balance: { increment: amountDiff } },
            }),
          ]
        : []),
    ]);

    return apiSuccess(transaction[0]);
  } catch {
    return apiError("Error al actualizar transacción", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id, deletedAt: null } as never,
    });

    if (!existing) {
      return apiError("Transacción no encontrada", 404);
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: existing.accountId, userId: session.user.id },
    });
    if (!account) {
      return apiError("Transacción no encontrada", 404);
    }

    const amount = Number(existing.amount);

    await prisma.$transaction([
      prisma.transaction.delete({ where: { id } }),
      // Reverse the balance change
      prisma.account.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: amount } },
      }),
      // If it's a transfer, also reverse the paired record
      ...(existing.transferPairId
        ? [
            prisma.transaction.findFirst({
              where: { id: existing.transferPairId } as never,
            }).then((paired) => {
              if (paired) {
                return prisma.$transaction([
                  prisma.transaction.delete({ where: { id: paired.id } }),
                  prisma.account.update({
                    where: { id: paired.accountId },
                    data: { balance: { decrement: Number(paired.amount) } },
                  }),
                ]);
              }
            }),
          ]
        : []),
    ]);

    return apiSuccess({ message: "Transacción eliminada" });
  } catch {
    return apiError("Error al eliminar transacción", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { id } = await params;

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id } as never,
      // Include soft-deleted to restore
    });

    if (!existing || !existing.deletedAt) {
      return apiError("Transacción no encontrada", 404);
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: existing.accountId, userId: session.user.id },
    });
    if (!account) {
      return apiError("Transacción no encontrada", 404);
    }

    const amount = Number(existing.amount);

    const transaction = await prisma.$transaction([
      prisma.transaction.restore({ where: { id } }),
      // Re-apply the balance change
      prisma.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: amount } },
      }),
    ]);

    return apiSuccess(transaction[0]);
  } catch {
    return apiError("Error al restaurar transacción", 500);
  }
}
