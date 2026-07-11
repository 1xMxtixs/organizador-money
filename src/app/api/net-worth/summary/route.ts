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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
      },
    });

    let totalAssets = 0;
    let totalLiabilities = 0;
    const assetBreakdown: Record<string, number> = {};
    const liabilityBreakdown: Record<string, number> = {};

    for (const account of accounts) {
      const balance = Number(account.balance);
      if (ASSET_TYPES.includes(account.type)) {
        totalAssets += Math.max(0, balance);
        assetBreakdown[account.type] =
          (assetBreakdown[account.type] ?? 0) + Math.max(0, balance);
      } else if (LIABILITY_TYPES.includes(account.type)) {
        totalLiabilities += Math.abs(Math.min(0, balance));
        liabilityBreakdown[account.type] =
          (liabilityBreakdown[account.type] ?? 0) + Math.abs(Math.min(0, balance));
      }
    }

    const netWorth = totalAssets - totalLiabilities;

    return apiSuccess({
      totalAssets,
      totalLiabilities,
      netWorth,
      assetBreakdown,
      liabilityBreakdown,
    });
  } catch {
    return apiError("Error al calcular patrimonio neto", 500);
  }
}
