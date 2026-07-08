import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createAccountSchema } from "@/lib/validations/account";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(accounts);
  } catch {
    return apiError("Error al obtener cuentas", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const body = await request.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { name, type, bankName, currencyCode, notes } = parsed.data;

    const existing = await prisma.account.findFirst({
      where: { userId: session.user.id, name },
    });

    if (existing) {
      return apiError("Ya existe una cuenta con ese nombre", 409);
    }

    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name,
        type,
        bankName,
        currencyCode,
        notes,
      },
    });

    return apiSuccess(account, 201);
  } catch {
    return apiError("Error al crear cuenta", 500);
  }
}
