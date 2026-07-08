import { z } from "zod";

export const transactionTypeEnum = z.enum(["income", "expense", "transfer"]);
export const transactionSourceEnum = z.enum(["manual", "import", "banking"]);

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive("El monto debe ser positivo"),
  description: z.string().min(1, "La descripción es obligatoria").max(200),
  date: z.string().datetime().or(z.date()),
  type: transactionTypeEnum,
  source: transactionSourceEnum.default("manual"),
  transferPairId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  amount: z.number().positive("El monto debe ser positivo").optional(),
});

export type TransactionType = z.infer<typeof transactionTypeEnum>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
