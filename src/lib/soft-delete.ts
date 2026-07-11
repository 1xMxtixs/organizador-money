/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "../generated/prisma/client";

/**
 * Prisma extension that implements soft delete behavior.
 *
 * For models with a `deletedAt` field:
 * - findMany / findFirst: auto-filter deletedAt IS NULL (query extension)
 * - delete / deleteMany: convert to update setting deletedAt = now() (model extension)
 * - restore: set deletedAt = null (escape hatch — model extension)
 *
 * Usage:
 *   const prisma = new PrismaClient({ adapter }).$extends(softDeleteExtension());
 */
export function softDeleteExtension() {
  const softDeleteModels = ["account", "transaction", "category", "label", "budget"];

  // Query extensions: intercept findMany/findFirst to auto-filter soft-deleted rows
  // Uses the Prisma 7.x { model: { operation: { args, query } } } pattern
  const queryExtensions: Record<string, Record<string, any>> = {};
  for (const model of softDeleteModels) {
    queryExtensions[model] = {
      findMany({ args, query }: { args: any; query: Function }) {
        args.where = { ...args?.where, deletedAt: null };
        return query(args);
      },
      findFirst({ args, query }: { args: any; query: Function }) {
        args.where = { ...args?.where, deletedAt: null };
        return query(args);
      },
    };
  }

  // Model extensions: delete/deleteMany → update with deletedAt, restore → update with deletedAt=null
  // These call 'update' which is NOT overridden, so no recursion
  const modelExtensions: Record<string, Record<string, any>> = {};
  for (const model of softDeleteModels) {
    modelExtensions[model] = {
      async delete(args: any) {
        const client = Prisma.getExtensionContext(this);
        return (client as any).update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany(args: any) {
        const client = Prisma.getExtensionContext(this);
        return (client as any).updateMany({
          ...args,
          data: { ...args?.data, deletedAt: new Date() },
        });
      },
      async restore(args: any) {
        const client = Prisma.getExtensionContext(this);
        return (client as any).update({
          where: args.where,
          data: { deletedAt: null },
        });
      },
      async restoreMany(args: any) {
        const client = Prisma.getExtensionContext(this);
        return (client as any).updateMany({
          ...args,
          data: { ...args?.where, deletedAt: null },
        });
      },
    };
  }

  return Prisma.defineExtension({
    name: "softDelete",
    query: queryExtensions,
    model: modelExtensions,
  });
}
