-- Migration: insert predefined monthly categories for existing users
-- Uses a CTE to cross-join users with the predefined set, inserting only missing ones.
-- Deleted predefined categories (deletedAt IS NOT NULL) are NOT re-seeded.

WITH predefined (name, icon, color, type, cashflow, sort) AS (
  VALUES
    ('Vivienda', '🏠', '#F59E0B', 'expense', 'outflow', 1),
    ('Suministros', '💡', '#F97316', 'expense', 'outflow', 2),
    ('Alimentación', '🍔', '#EF4444', 'expense', 'outflow', 3),
    ('Transporte', '🚗', '#3B82F6', 'expense', 'outflow', 4),
    ('Ocio', '🎭', '#8B5CF6', 'expense', 'outflow', 5),
    ('Salud', '💊', '#10B981', 'expense', 'outflow', 6),
    ('Educación', '📚', '#6366F1', 'expense', 'outflow', 7),
    ('Mascotas', '🐾', '#F59E0B', 'expense', 'outflow', 8),
    ('Impuestos', '🏛️', '#6B7280', 'expense', 'outflow', 9),
    ('Suscripciones', '📱', '#EC4899', 'expense', 'outflow', 10),
    ('Sueldo', '💼', '#10B981', 'income', 'inflow', 11),
    ('Negocio', '🏢', '#3B82F6', 'income', 'inflow', 12),
    ('Otros', '📦', '#6B7280', 'income', 'inflow', 13)
)
INSERT INTO "Category" (id, "userId", name, icon, color, type, "cashflowDirection", "isDefault", "sortOrder", "createdAt", "updatedAt")
SELECT gen_random_uuid(), u.id, p.name, p.icon, p.color, p.type::"CategoryType", p.cashflow::"CashflowDirection", true, p.sort, NOW(), NOW()
FROM "User" u
CROSS JOIN predefined p
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c
  WHERE c."userId" = u.id AND c.name = p.name AND c.type = p.type::"CategoryType" AND c."deletedAt" IS NULL
);
