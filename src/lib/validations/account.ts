import { z } from "zod";

export const accountTypeEnum = z.enum([
  "checking",
  "savings",
  "credit_card",
  "investment",
  "cash",
  "loan",
  "real_estate",
]);

export type AccountType = z.infer<typeof accountTypeEnum>;

export const createAccountSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  type: accountTypeEnum,
  bankName: z.string().max(100).optional(),
  currencyCode: z.string().length(3).default("CLP"),
  notes: z.string().max(500).optional(),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  name: z.string().min(1, "El nombre es obligatorio").max(100).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
