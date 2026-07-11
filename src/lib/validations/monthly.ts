import { z } from "zod";

export const monthParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Formato inválido. Use YYYY-MM")
  .optional();

export type MonthParam = z.infer<typeof monthParamSchema>;
