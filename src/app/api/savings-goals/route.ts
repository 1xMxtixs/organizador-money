import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSavingsGoalSchema } from "@/lib/validations/savings-goal";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: session.user.id },
      include: {
        account: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute progress for each goal: SUM of income transactions to accountId WHERE date >= goal.createdAt
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal: (typeof goals)[number]) => {
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
        const progressPercent = target > 0 ? Math.min((saved / target) * 100, 100) : 0;

        return {
          id: goal.id,
          name: goal.name,
          icon: goal.icon,
          targetAmount: target,
          deadline: goal.deadline,
          isCompleted: goal.isCompleted,
          completedAt: goal.completedAt,
          createdAt: goal.createdAt,
          account: goal.account,
          progress: {
            saved,
            target,
            progressPercent: Math.round(progressPercent * 100) / 100,
          },
        };
      })
    );

    return apiSuccess(goalsWithProgress);
  } catch {
    return apiError("Error al obtener metas de ahorro", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const body = await request.json();
    const parsed = createSavingsGoalSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { name, icon, targetAmount, accountId, deadline } = parsed.data;

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) {
      return apiError("Cuenta no encontrada", 404);
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        accountId,
        name,
        icon,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        account: {
          select: { id: true, name: true },
        },
      },
    });

    return apiSuccess(
      {
        ...goal,
        targetAmount: Number(goal.targetAmount),
        progress: { saved: 0, target: Number(goal.targetAmount), progressPercent: 0 },
      },
      201
    );
  } catch {
    return apiError("Error al crear meta de ahorro", 500);
  }
}
