import { z } from "zod";

export const managerProjectsQuerySchema = z.object({
  query: z.object({
    pageParam: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
  }),
});

export const managerClientsQuerySchema = z.object({
  query: z.object({
    pageParam: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
  }),
});
