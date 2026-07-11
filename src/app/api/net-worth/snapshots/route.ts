import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { z } from "zod";

const createSnapshotSchema = z.object({
  totalAssets: z.number(),
  totalLiabilities: z.number(),
  netWorth: z.number(),
  snapshotAt: z.string().datetime().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (from || to) {
      where.snapshotAt = {};
      if (from) (where.snapshotAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.snapshotAt as Record<string, unknown>).lte = new Date(to);
    }

    const snapshots = await prisma.netWorthSnapshot.findMany({
      where,
      orderBy: { snapshotAt: "asc" },
    });

    return apiSuccess(
      snapshots.map((s: { id: string; totalAssets: unknown; totalLiabilities: unknown; netWorth: unknown; snapshotAt: Date; createdAt: Date }) => ({
        id: s.id,
        totalAssets: Number(s.totalAssets),
        totalLiabilities: Number(s.totalLiabilities),
        netWorth: Number(s.netWorth),
        snapshotAt: s.snapshotAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
      })),
    );
  } catch {
    return apiError("Error al obtener snapshots", 500);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("No autorizado", 401);
  }

  try {
    const body = await request.json();
    const parsed = createSnapshotSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { totalAssets, totalLiabilities, netWorth, snapshotAt } = parsed.data;
    const snapshotDate = snapshotAt ? new Date(snapshotAt) : new Date();

    // Upsert: same day snapshot = update
    const startOfDay = new Date(snapshotDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(snapshotDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.netWorthSnapshot.findFirst({
      where: {
        userId: session.user.id,
        snapshotAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    let snapshot;
    if (existing) {
      snapshot = await prisma.netWorthSnapshot.update({
        where: { id: existing.id },
        data: { totalAssets, totalLiabilities, netWorth },
      });
    } else {
      snapshot = await prisma.netWorthSnapshot.create({
        data: {
          userId: session.user.id,
          totalAssets,
          totalLiabilities,
          netWorth,
          snapshotAt: snapshotDate,
        },
      });
    }

    return apiSuccess({
      id: snapshot.id,
      totalAssets: Number(snapshot.totalAssets),
      totalLiabilities: Number(snapshot.totalLiabilities),
      netWorth: Number(snapshot.netWorth),
      snapshotAt: snapshot.snapshotAt.toISOString(),
    }, existing ? 200 : 201);
  } catch {
    return apiError("Error al guardar snapshot", 500);
  }
}
