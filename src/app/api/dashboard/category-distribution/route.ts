import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const expenses = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        account: { userId },
        type: "expense",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    const categoryIds = expenses
      .map((e) => e.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true, color: true },
    });

    const categoryMap = new Map<string, CategoryInfo>(
      (categories as unknown as CategoryInfo[]).map((c) => [c.id, c]),
    );

    const distribution = expenses
      .filter((e) => e.categoryId !== null)
      .map((e) => {
        const cat = categoryMap.get(e.categoryId!);
        return {
          categoryId: e.categoryId!,
          name: cat?.name ?? "Sin categoría",
          icon: cat?.icon ?? "📋",
          color: cat?.color ?? "#6b7280",
          amount: Number(e._sum.amount ?? 0),
        };
      });

    return apiSuccess(distribution);
  } catch {
    return apiError("Error al obtener distribución", 500);
  }
}
