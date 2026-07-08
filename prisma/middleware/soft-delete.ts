import { Prisma } from "../src/generated/prisma";

/**
 * Prisma extension that implements soft delete behavior.
 *
 * For models with a `deletedAt` field:
 * - findMany / findFirst: auto-filter deletedAt IS NULL
 * - delete / deleteMany: convert to update setting deletedAt = now()
 * - restore: set deletedAt = null (escape hatch)
 *
 * Usage:
 *   const prisma = new PrismaClient().$extends(softDeleteExtension());
 */
export function softDeleteExtension() {
  return Prisma.defineExtension({
    name: "softDelete",
    model: {
      Account: {
        async findMany(args: Prisma.AccountFindManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findMany({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async findFirst(args: Prisma.AccountFindFirstArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findFirst({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async delete(args: Prisma.AccountDeleteArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: Prisma.AccountDeleteManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: { where: Prisma.AccountWhereUniqueInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: { where: Prisma.AccountWhereInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },

      Transaction: {
        async findMany(args: Prisma.TransactionFindManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findMany({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async findFirst(args: Prisma.TransactionFindFirstArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findFirst({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async delete(args: Prisma.TransactionDeleteArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: Prisma.TransactionDeleteManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: { where: Prisma.TransactionWhereUniqueInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: { where: Prisma.TransactionWhereInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },

      Category: {
        async findMany(args: Prisma.CategoryFindManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findMany({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async findFirst(args: Prisma.CategoryFindFirstArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findFirst({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async delete(args: Prisma.CategoryDeleteArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: Prisma.CategoryDeleteManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: { where: Prisma.CategoryWhereUniqueInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: { where: Prisma.CategoryWhereInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },

      Label: {
        async findMany(args: Prisma.LabelFindManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findMany({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async findFirst(args: Prisma.LabelFindFirstArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).findFirst({
            ...args,
            where: { ...args.where, deletedAt: null },
          });
        },
        async delete(args: Prisma.LabelDeleteArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: Prisma.LabelDeleteManyArgs) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: { where: Prisma.LabelWhereUniqueInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: { where: Prisma.LabelWhereInput }) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },
    },
  });
}
