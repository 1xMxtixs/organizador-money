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
  { name: "Vivienda", icon: "🏠", color: "#F59E0B", type: "expense", cashflowDirection: "outflow", sortOrder: 1 },
  { name: "Suministros", icon: "💡", color: "#F97316", type: "expense", cashflowDirection: "outflow", sortOrder: 2 },
  { name: "Alimentación", icon: "🍔", color: "#EF4444", type: "expense", cashflowDirection: "outflow", sortOrder: 3 },
  { name: "Transporte", icon: "🚗", color: "#3B82F6", type: "expense", cashflowDirection: "outflow", sortOrder: 4 },
  { name: "Ocio", icon: "🎭", color: "#8B5CF6", type: "expense", cashflowDirection: "outflow", sortOrder: 5 },
  { name: "Salud", icon: "💊", color: "#10B981", type: "expense", cashflowDirection: "outflow", sortOrder: 6 },
  { name: "Educación", icon: "📚", color: "#6366F1", type: "expense", cashflowDirection: "outflow", sortOrder: 7 },
  { name: "Mascotas", icon: "🐾", color: "#F59E0B", type: "expense", cashflowDirection: "outflow", sortOrder: 8 },
  { name: "Impuestos", icon: "🏛️", color: "#6B7280", type: "expense", cashflowDirection: "outflow", sortOrder: 9 },
  { name: "Suscripciones", icon: "📱", color: "#EC4899", type: "expense", cashflowDirection: "outflow", sortOrder: 10 },

  // ─── Income (inflow) ────────────────────────────────────────────────────────
  { name: "Sueldo", icon: "💼", color: "#10B981", type: "income", cashflowDirection: "inflow", sortOrder: 11 },
  { name: "Negocio", icon: "🏢", color: "#3B82F6", type: "income", cashflowDirection: "inflow", sortOrder: 12 },
  { name: "Otros", icon: "📦", color: "#6B7280", type: "income", cashflowDirection: "inflow", sortOrder: 13 },
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
      currencyCode: "CLP",
      locale: "es-CL",
      timezone: "America/Santiago",
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
