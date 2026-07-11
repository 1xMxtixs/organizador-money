import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createBudgetSchema } from "@/lib/validations/budget";
import { apiSuccess, apiError } from "@/lib/api-response";
import { Prisma } from "@/generated/prisma/client";

type BudgetWithCategoryAndPeriods = Prisma.BudgetGetPayload<{
  include: {
    category: { select: { name: true; icon: true; color: true } };
    periods: true;
  };
}>;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id },
      include: {
        category: {
          select: { name: true, icon: true, color: true },
        },
        periods: {
          where: {
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to include current period aggregation
    const budgetsWithPeriod = budgets.map((budget: BudgetWithCategoryAndPeriods) => {
      const currentPeriod = budget.periods[0] || null;
      let amountSpent = 0;
      let variance = 0;
      let status: "under" | "on-target" | "over" = "under";

      if (currentPeriod) {
        amountSpent = Number(currentPeriod.amountSpent);
        const limit = Number(budget.amountLimit);
        variance = limit > 0 ? ((amountSpent - limit) / limit) * 100 : 0;
        if (amountSpent > limit) {
          status = "over";
        } else if (Math.abs(variance) < 1) {
          status = "on-target";
        }
      }

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        category: budget.category,
        amountLimit: Number(budget.amountLimit),
        period: budget.period,
        isActive: budget.isActive,
        note: budget.note,
        currentPeriod: currentPeriod
          ? {
              amountSpent,
              variance: Math.round(variance * 100) / 100,
              status,
            }
          : null,
      };
    });

    return apiSuccess(budgetsWithPeriod);
  } catch {
    return apiError("Error al obtener presupuestos", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const body = await request.json();
    const parsed = createBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { categoryId, amountLimit, period, note } = parsed.data;

    // Check for duplicate budget for this category
    const existing = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId,
        deletedAt: null,
      },
    });

    if (existing) {
      return apiError("Ya existe un presupuesto para esta categoría", 409);
    }

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId,
        amountLimit,
        period,
        note,
      },
      include: {
        category: {
          select: { name: true, icon: true, color: true },
        },
      },
    });

    return apiSuccess(budget, 201);
  } catch {
    return apiError("Error al crear presupuesto", 500);
  }
}
