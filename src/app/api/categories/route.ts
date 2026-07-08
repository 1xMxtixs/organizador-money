import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validations/category";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return apiSuccess(categories);
  } catch {
    return apiError("Error al obtener categorías", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { name, icon, color, type, cashflowDirection } = parsed.data;

    const existing = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name,
        type,
        deletedAt: null,
      },
    });

    if (existing) {
      return apiError("Ya existe una categoría con ese nombre", 409);
    }

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        icon,
        color,
        type,
        cashflowDirection,
      },
    });

    return apiSuccess(category, 201);
  } catch {
    return apiError("Error al crear categoría", 500);
  }
}
