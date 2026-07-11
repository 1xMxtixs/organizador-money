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
  "rent", "alquiler", "utilities", "servicios", "water", "agua",
  "electricity", "electricidad", "gas", "internet", "phone", "teléfono",
  "food", "alimentos", "groceries", "supermercado", "transport",
  "transporte", "fuel", "combustible", "insurance", "seguro", "health",
  "salud", "medical", "médico", "pharmacy", "farmacia", "mortgage",
  "hipoteca", "taxes", "impuestos", "education", "educación",
  "childcare", "guardería",
];
const WANTS_KEYWORDS = [
  "entertainment", "entretenimiento", "dining out", "restaurant",
  "restaurante", "bar", "cafe", "café", "coffee", "shopping", "compras",
  "clothing", "ropa", "gym", "gimnasio", "fitness", "subscription",
  "suscripción", "netflix", "spotify", "hobby", "travel", "viaje",
  "vacation", "vacaciones", "beauty", "belleza", "spa", "gifts",
  "regalos", "pets", "mascotas", "alcohol", "snacks",
];
const SAVINGS_KEYWORDS = [
  "savings", "ahorro", "transfer", "transferencia", "investment",
  "inversión", "emergency fund", "fondo de emergencia", "retirement",
  "jubilación", "pension", "pensión",
];

function classifyCategory(categoryName: string): "needs" | "wants" | "savings" {
  const lower = categoryName.toLowerCase();
  for (const kw of SAVINGS_KEYWORDS) if (lower.includes(kw)) return "savings";
  for (const kw of NEEDS_KEYWORDS) if (lower.includes(kw)) return "needs";
  for (const kw of WANTS_KEYWORDS) if (lower.includes(kw)) return "wants";
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
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [accounts, incomeSum, expenseSum, expensesByCategory, budgets] = await Promise.all([
      prisma.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true, type: true },
      }),
      prisma.transaction.aggregate({
        where: {
          account: { userId },
          type: "income",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          account: { userId },
          type: "expense",
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
        include: { category: { select: { id: true, name: true } } },
      }),
    ]);

    const totalBalance = accounts.reduce(
      (sum: number, acc: { balance: unknown }) => sum + Number(acc.balance),
      0,
    );
    const monthlyIncome = Number(incomeSum._sum.amount ?? 0);
    const monthlyExpenses = Number(expenseSum._sum.amount ?? 0);
    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Savings rate
    const savingsRate = monthlyIncome > 0
      ? Math.round((monthlySavings / monthlyIncome) * 100)
      : null;

    // Budget distribution by 50/30/20
    const budgetMap = new Map<string, string>();
    for (const b of budgets) budgetMap.set(b.categoryId, b.category.name);

    const categoryIds = expensesByCategory
      .filter((e: { categoryId: string | null }) => e.categoryId)
      .map((e: { categoryId: string | null }) => e.categoryId!);
    const categories = categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];
    const categoryNameMap = new Map<string, string>(
      categories.map((c: { id: string; name: string }) => [c.id, c.name]),
    );

    const distribution = { needs: 0, wants: 0, savings: 0 };
    for (const exp of expensesByCategory) {
      const amount = Number(exp._sum.amount ?? 0);
      const catId = exp.categoryId;
      let type: "needs" | "wants" | "savings";
      if (catId && budgetMap.has(catId)) {
        type = classifyCategory(budgetMap.get(catId)!);
      } else if (catId && categoryNameMap.has(catId)) {
        const catName = categoryNameMap.get(catId) ?? "";
        type = classifyCategory(catName);
      } else {
        type = "needs";
      }
      distribution[type] += amount;
    }

    // Net worth
    let totalAssets = 0;
    let totalLiabilities = 0;
    for (const acc of accounts) {
      const balance = Number(acc.balance);
      if (ASSET_TYPES.includes(acc.type)) totalAssets += Math.max(0, balance);
      else if (LIABILITY_TYPES.includes(acc.type)) totalLiabilities += Math.abs(Math.min(0, balance));
    }
    const netWorth = totalAssets - totalLiabilities;

    return apiSuccess({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      budgetDistribution: distribution,
      netWorth,
    });
  } catch {
    return apiError("Error al obtener resumen", 500);
  }
}
