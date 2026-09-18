import { z } from "zod";

export const addPaymentSchema = z.object({
  body: z.object({
    projectId: z.string().min(1),
    paymentAmount: z.coerce.number().positive(),
    paymentMethod: z.string().min(1),
    transactionId: z.string().optional().default(""),
    paymentDate: z.coerce.date(),
  }),
});

export const updatePaymentSchema = z.object({
  params: z.object({
    paymentId: z.string().min(1),
  }),
  body: z.object({
    projectId: z.string().min(1),
    paymentAmount: z.coerce.number().positive(),
    paymentMethod: z.string().min(1),
    transactionId: z.string().optional().default(""),
    paymentDate: z.coerce.date(),
  }),
});

export const paymentIdParamsSchema = z.object({
  params: z.object({
    paymentId: z.string().min(1),
  }),
});
