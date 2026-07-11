import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { AccountType } from "@/generated/prisma/client";

const ASSET_TYPES: AccountType[] = [
  "checking",
  "savings",
  "investment",
  "cash",
  "real_estate",
];
const LIABILITY_TYPES: AccountType[] = ["credit_card", "loan"];

// Category name → type heuristics (lowercase matching)
const NEEDS_KEYWORDS = [
  "rent",
  "alquiler",
  "utilities",
  "servicios",
  "water",
  "agua",
  "electricity",
  "electricidad",
  "gas",
  "internet",
  "phone",
  "teléfono",
  "food",
  "alimentos",
  "groceries",
  "supermercado",
  "transport",
  "transporte",
  "fuel",
  "combustible",
  "insurance",
  "seguro",
  "health",
  "salud",
  "medical",
  "médico",
  "pharmacy",
  "farmacia",
  "mortgage",
  "hipoteca",
  "taxes",
  "impuestos",
  "education",
  "educación",
  "childcare",
  "guardería",
];

const WANTS_KEYWORDS = [
  "entertainment",
  "entretenimiento",
  "dining out",
  "restaurant",
  "restaurante",
  "bar",
  "cafe",
  "café",
  "coffee",
  "coffee shop",
  "shopping",
  "compras",
  "clothing",
  "ropa",
  "gym",
  "gimnasio",
  "fitness",
  "subscription",
  "suscripción",
  "netflix",
  "spotify",
  "hobby",
  "hobbies",
  "travel",
  "viaje",
  "vacation",
  "vacaciones",
  "beauty",
  "belleza",
  "spa",
  "gifts",
  "regalos",
  "pets",
  "mascotas",
  "alcohol",
  "snacks",
];

const SAVINGS_KEYWORDS = [
  "savings",
  "ahorro",
  "transfer",
  "transferencia",
  "investment",
  "inversión",
  "emergency fund",
  "fondo de emergencia",
  "retirement",
  "jubilación",
  "pension",
  "pensión",
];

function classifyCategory(
  categoryName: string,
): "needs" | "wants" | "savings" {
  const lower = categoryName.toLowerCase();

  for (const keyword of SAVINGS_KEYWORDS) {
    if (lower.includes(keyword)) return "savings";
  }
  for (const keyword of NEEDS_KEYWORDS) {
    if (lower.includes(keyword)) return "needs";
  }
  for (const keyword of WANTS_KEYWORDS) {
    if (lower.includes(keyword)) return "wants";
  }

  // Default: needs (essential by default)
  return "needs";
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
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Fetch income, expenses by category, budgets, and accounts in parallel
    const [incomeSum, expensesByCategory, budgets, accounts] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: {
            account: { userId },
            type: "income",
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.groupBy({
          by: ["categoryId"],
          where: {
            account: { userId },
            type: "expense",
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.budget.findMany({
          where: { userId, isActive: true, deletedAt: null },
          include: {
            category: { select: { id: true, name: true } },
          },
        }),
        prisma.account.findMany({
          where: { userId, isActive: true, deletedAt: null },
          select: { type: true, balance: true },
        }),
      ]);

    const monthlyIncome = Number(incomeSum._sum.amount ?? 0);

    // Build budget map: categoryId → budget
    const budgetMap = new Map<
      string,
      { amountLimit: number; categoryName: string }
    >();
    for (const budget of budgets) {
      budgetMap.set(budget.categoryId, {
        amountLimit: Number(budget.amountLimit),
        categoryName: budget.category.name,
      });
    }

    // Fetch category names for uncategorized expenses
    const categoryIds = expensesByCategory
      .filter((e: { categoryId: string | null }) => e.categoryId)
      .map((e: { categoryId: string | null }) => e.categoryId!);
    const categories =
      categoryIds.length > 0
        ? await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : [];
    const categoryNameMap = new Map<string, string>(
      categories.map((c: { id: string; name: string }) => [c.id, c.name]),
    );

    // Classify expenses into 50/30/20 buckets
    const distribution = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    const categoryBreakdown: {
      name: string;
      type: "needs" | "wants" | "savings";
      amount: number;
    }[] = [];

    for (const exp of expensesByCategory) {
      const amount = Number(exp._sum.amount ?? 0);
      const categoryId = exp.categoryId;

      let type: "needs" | "wants" | "savings";

      // Budget override: if category has a budget, use budget's classification
      if (categoryId && budgetMap.has(categoryId)) {
        const budgetInfo = budgetMap.get(categoryId)!;
        type = classifyCategory(budgetInfo.categoryName);
      } else if (categoryId && categoryNameMap.has(categoryId)) {
        const catName = categoryNameMap.get(categoryId) ?? "";
        type = classifyCategory(catName);
      } else {
        type = "needs"; // Uncategorized = needs
      }

      distribution[type] += amount;

      categoryBreakdown.push({
        name:
          (categoryId && categoryNameMap.get(categoryId)) ?? "Sin categoría",
        type,
        amount,
      });
    }

    // If no expenses, income → savings bucket
    if (
      Object.values(distribution).every((v) => v === 0) &&
      monthlyIncome > 0
    ) {
      distribution.savings = monthlyIncome;
      categoryBreakdown.push({
        name: "Ingresos totales",
        type: "savings",
        amount: monthlyIncome,
      });
    }

    // Savings rate
    const savingsRate =
      monthlyIncome > 0
        ? Math.round(((monthlyIncome - Object.values(distribution).reduce((a, b) => a + b, 0)) / monthlyIncome) * 100)
        : null;

    // Net worth from accounts
    let totalAssets = 0;
    let totalLiabilities = 0;
    for (const account of accounts) {
      const balance = Number(account.balance);
      if (ASSET_TYPES.includes(account.type)) {
        totalAssets += Math.max(0, balance);
      } else if (LIABILITY_TYPES.includes(account.type)) {
        totalLiabilities += Math.abs(Math.min(0, balance));
      }
    }
    const netWorth = totalAssets - totalLiabilities;

    return apiSuccess({
      distribution,
      categoryBreakdown,
      savingsRate,
      netWorth,
      monthlyIncome,
      monthlyExpenses: Object.values(distribution).reduce((a, b) => a + b, 0),
    });
  } catch {
    return apiError("Error al obtener datos de planificación", 500);
  }
}
