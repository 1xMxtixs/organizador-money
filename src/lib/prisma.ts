import { PrismaClient } from "../generated/prisma";
import { softDeleteExtension } from "../prisma/middleware/soft-delete";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  return new PrismaClient().$extends(softDeleteExtension());
}

/**
 * Prisma client singleton with soft-delete extension.
 *
 * In development, cache on globalThis to survive hot reloads.
 * In production, a single instance is fine.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
