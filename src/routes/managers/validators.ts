import { z } from "zod";

export const managerProjectsQuerySchema = z.object({
  query: z.object({
    pageParam: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
  }),
});

export const createClientSchema = z.object({
  body: z.object({
    clientName: z.string().min(1),
    clientPhone: z.string().min(1),
    clientEmail: z.string().email(),
    password: z.string().min(6).optional(),
  }),
});

export const managerClientsQuerySchema = z.object({
  query: z.object({
    pageParam: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
  }),
});
