import { z } from "zod";

export const budgetPeriodTypeEnum = z.enum(["monthly", "weekly", "yearly"]);

export type BudgetPeriodType = z.infer<typeof budgetPeriodTypeEnum>;

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("ID de categoría inválido"),
  amountLimit: z
    .number()
    .positive("El monto límite debe ser mayor a 0")
    .max(999999999999.99, "Monto límite demasiado alto"),
  period: budgetPeriodTypeEnum.default("monthly"),
  note: z.string().max(500).optional(),
});

export const updateBudgetSchema = z.object({
  amountLimit: z
    .number()
    .positive("El monto límite debe ser mayor a 0")
    .max(999999999999.99, "Monto límite demasiado alto")
    .optional(),
  period: budgetPeriodTypeEnum.optional(),
  note: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
