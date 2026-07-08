import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
  const accountId = searchParams.get("accountId");
  const categoryId = searchParams.get("categoryId");
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    // Get the account's userId to verify ownership
    const where: Record<string, unknown> = {};

    if (accountId) {
      where.accountId = accountId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (type) {
      where.type = type;
    }
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }

    // If filtering by accountId, verify the account belongs to the user
    if (accountId) {
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId: session.user.id },
      });
      if (!account) {
        return apiError("Cuenta no encontrada", 404);
      }
    } else {
      // Get all user account IDs to scope transactions
      const accounts = await prisma.account.findMany({
        where: { userId: session.user.id },
        select: { id: true },
      });
      const accountIds = accounts.map((acc: { id: string }) => acc.id);
      where.accountId = { in: accountIds };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, currencyCode: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { date: "desc" },
      take: limit + 1, // Fetch one extra to check if there's a next page
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
    });

    const hasMore = transactions.length > limit;
    const data = hasMore ? transactions.slice(0, limit) : transactions;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return apiSuccess({ items: data, nextCursor, hasMore });
  } catch {
    return apiError("Error al obtener transacciones", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { accountId, categoryId, amount, description, date, type, source, notes } =
      parsed.data;

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) {
      return apiError("Cuenta no encontrada", 404);
    }

    // Auto-negate amount for expenses
    const signedAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);

    if (type === "transfer") {
      const toAccountId = body.toAccountId as string | undefined;
      if (!toAccountId) {
        return apiError("Se requiere toAccountId para transferencias", 400);
      }
      if (toAccountId === accountId) {
        return apiError("No se puede transferir a la misma cuenta", 400);
      }

      // Verify destination account belongs to user
      const toAccount = await prisma.account.findFirst({
        where: { id: toAccountId, userId: session.user.id },
      });
      if (!toAccount) {
        return apiError("Cuenta destino no encontrada", 404);
      }

      // Create paired transfer records in a transaction
      const [debitTx, creditTx] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            accountId,
            categoryId,
            amount: -Math.abs(amount),
            description,
            date: new Date(date),
            type: "expense",
            source: source ?? "manual",
            transferPairId: null,
            notes,
          },
        }),
        prisma.transaction.create({
          data: {
            accountId: toAccountId,
            categoryId,
            amount: Math.abs(amount),
            description,
            date: new Date(date),
            type: "income",
            source: source ?? "manual",
            transferPairId: null,
            notes,
          },
        }),
      ]);

      // Link them via transferPairId (point to each other)
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: debitTx.id },
          data: { transferPairId: creditTx.id },
        }),
        prisma.transaction.update({
          where: { id: creditTx.id },
          data: { transferPairId: debitTx.id },
        }),
        prisma.account.update({
          where: { id: accountId },
          data: { balance: { decrement: Math.abs(amount) } },
        }),
        prisma.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: Math.abs(amount) } },
        }),
      ]);

      return apiSuccess({ from: debitTx, to: creditTx }, 201);
    }

    // Regular income or expense
    const transaction = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          accountId,
          categoryId,
          amount: signedAmount,
          description,
          date: new Date(date),
          type,
          source: source ?? "manual",
          notes,
        },
      }),
      prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            [type === "income" ? "increment" : "decrement"]: Math.abs(amount),
          },
        },
      }),
    ]);

    return apiSuccess(transaction[0], 201);
  } catch {
    return apiError("Error al crear transacción", 500);
  }
}
