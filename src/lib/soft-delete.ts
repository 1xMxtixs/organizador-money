/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "../generated/prisma/client";

/**
 * Prisma extension that implements soft delete behavior.
 *
 * For models with a `deletedAt` field:
 * - findMany / findFirst: auto-filter deletedAt IS NULL
 * - delete / deleteMany: convert to update setting deletedAt = now()
 * - restore: set deletedAt = null (escape hatch)
 *
 * Usage:
 *   const prisma = new PrismaClient({ adapter }).$extends(softDeleteExtension());
 */
export function softDeleteExtension() {
  return Prisma.defineExtension({
    name: "softDelete",
    model: {
      Account: {
        async findMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).account.findMany({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async findFirst(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).account.findFirst({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async delete(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).account.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).account.updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).account.update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).account.updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },

      Transaction: {
        async findMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).transaction.findMany({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async findFirst(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).transaction.findFirst({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async delete(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).transaction.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).transaction.updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).transaction.update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).transaction.updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },

      Category: {
        async findMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).category.findMany({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async findFirst(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).category.findFirst({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async delete(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).category.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).category.updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).category.update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).category.updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },

      Label: {
        async findMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).label.findMany({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async findFirst(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).label.findFirst({
            ...args,
            where: { ...args?.where, deletedAt: null },
          });
        },
        async delete(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).label.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).label.updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },
        async restore(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).label.update({
            where: args.where,
            data: { deletedAt: null },
          });
        },
        async restoreMany(args: any) {
          const client = Prisma.getExtensionContext(this);
          return (client as any).label.updateMany({
            where: args.where,
            data: { deletedAt: null },
          });
        },
      },
    },
  });
}
