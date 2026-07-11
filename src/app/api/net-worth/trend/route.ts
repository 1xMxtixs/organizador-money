import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") ?? "6", 10);
    const limit = Math.min(Math.max(months, 1), 60);

    const since = new Date();
    since.setMonth(since.getMonth() - limit);

    const snapshots = await prisma.netWorthSnapshot.findMany({
      where: {
        userId: session.user.id,
        snapshotAt: { gte: since },
      },
      orderBy: { snapshotAt: "asc" },
    });

    // Group by month (YYYY-MM) and take last snapshot per month
    const monthlyMap = new Map<string, (typeof snapshots)[0]>();
    for (const snap of snapshots) {
      const key = snap.snapshotAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyMap.set(key, snap);
    }

    const trend = Array.from(monthlyMap.values()).map((s) => ({
      month: s.snapshotAt.toISOString().slice(0, 7),
      netWorth: Number(s.netWorth),
      assets: Number(s.totalAssets),
      liabilities: Number(s.totalLiabilities),
    }));

    return apiSuccess(trend);
  } catch {
    return apiError("Error al obtener tendencia de patrimonio", 500);
  }
}
