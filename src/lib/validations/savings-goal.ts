import { z } from "zod";

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  icon: z.string().default("🎯"),
  targetAmount: z
    .number()
    .positive("El monto meta debe ser mayor a 0")
    .max(999999999999.99, "Monto demasiado alto"),
  accountId: z.string().uuid("ID de cuenta inválido"),
  deadline: z.string().optional().nullable(),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100).optional(),
  icon: z.string().optional(),
  targetAmount: z
    .number()
    .positive("El monto meta debe ser mayor a 0")
    .max(999999999999.99, "Monto demasiado alto")
    .optional(),
  accountId: z.string().uuid("ID de cuenta inválido").optional(),
  deadline: z.string().optional().nullable(),
});

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
