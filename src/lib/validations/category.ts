import { z } from "zod";

export const categoryTypeEnum = z.enum([
  "income",
  "expense",
  "investment",
  "saving",
]);
export const cashflowDirectionEnum = z.enum(["inflow", "outflow"]);

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50),
  icon: z.string().min(1, "El ícono es obligatorio").max(10),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hex válido"),
  type: categoryTypeEnum,
  cashflowDirection: cashflowDirectionEnum,
});

export const updateCategorySchema = createCategorySchema.partial();

export type CategoryType = z.infer<typeof categoryTypeEnum>;
export type CashflowDirection = z.infer<typeof cashflowDirectionEnum>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
