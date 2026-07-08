import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { CategoryType, CashflowDirection } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

type SeedCategory = {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  cashflowDirection: CashflowDirection;
  sortOrder: number;
};

const DEFAULT_CATEGORIES: SeedCategory[] = [
  // ─── Expense (outflow) ──────────────────────────────────────────────────────
  { name: "Alimentación", icon: "🍔", color: "#EF4444", type: "expense", cashflowDirection: "outflow", sortOrder: 1 },
  { name: "Vivienda", icon: "🏠", color: "#F59E0B", type: "expense", cashflowDirection: "outflow", sortOrder: 2 },
  { name: "Transporte", icon: "🚗", color: "#3B82F6", type: "expense", cashflowDirection: "outflow", sortOrder: 3 },
  { name: "Entretenimiento", icon: "🎭", color: "#8B5CF6", type: "expense", cashflowDirection: "outflow", sortOrder: 4 },
  { name: "Ropa", icon: "👕", color: "#EC4899", type: "expense", cashflowDirection: "outflow", sortOrder: 5 },
  { name: "Salud", icon: "💊", color: "#10B981", type: "expense", cashflowDirection: "outflow", sortOrder: 6 },
  { name: "Educación", icon: "📚", color: "#6366F1", type: "expense", cashflowDirection: "outflow", sortOrder: 7 },
  { name: "Servicios", icon: "💳", color: "#F97316", type: "expense", cashflowDirection: "outflow", sortOrder: 8 },
  { name: "Otros gastos", icon: "🎁", color: "#6B7280", type: "expense", cashflowDirection: "outflow", sortOrder: 9 },

  // ─── Income (inflow) ────────────────────────────────────────────────────────
  { name: "Salario", icon: "💼", color: "#10B981", type: "income", cashflowDirection: "inflow", sortOrder: 10 },
  { name: "Freelance", icon: "💰", color: "#3B82F6", type: "income", cashflowDirection: "inflow", sortOrder: 11 },
  { name: "Inversiones", icon: "📈", color: "#8B5CF6", type: "income", cashflowDirection: "inflow", sortOrder: 12 },
  { name: "Otros ingresos", icon: "🎁", color: "#6B7280", type: "income", cashflowDirection: "inflow", sortOrder: 13 },

  // ─── Saving ─────────────────────────────────────────────────────────────────
  { name: "Ahorro", icon: "🏦", color: "#10B981", type: "saving", cashflowDirection: "inflow", sortOrder: 14 },

  // ─── Investment ─────────────────────────────────────────────────────────────
  { name: "Inversión", icon: "📊", color: "#6366F1", type: "investment", cashflowDirection: "inflow", sortOrder: 15 },
  { name: "Bienes raíces", icon: "🏠", color: "#F59E0B", type: "investment", cashflowDirection: "inflow", sortOrder: 16 },
];

async function main() {
  console.log("🌱 Seeding default categories...\n");

  // Find or create a system user for seeded categories
  const systemEmail = "system@organizador-money.local";
  const systemUser = await prisma.user.upsert({
    where: { email: systemEmail },
    update: {},
    create: {
      email: systemEmail,
      passwordHash: "SYSTEM_USER_DO_NOT_LOGIN",
      encryptionSalt: "SYSTEM",
      name: "Sistema",
      currencyCode: "ARS",
      locale: "es-AR",
      timezone: "America/Argentina/Buenos_Aires",
    },
  });

  console.log(`  System user: ${systemUser.id}`);

  // Seed categories (skip if already exist for this user)
  let created = 0;
  let skipped = 0;

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: systemUser.id,
        name: cat.name,
        type: cat.type,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.category.create({
      data: {
        userId: systemUser.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        cashflowDirection: cat.cashflowDirection,
        isDefault: true,
        sortOrder: cat.sortOrder,
      },
    });
    created++;
    console.log(`  ✅ ${cat.icon} ${cat.name} (${cat.type})`);
  }

  console.log(`\n✨ Done: ${created} created, ${skipped} skipped (already exist)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
