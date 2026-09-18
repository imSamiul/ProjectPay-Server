import { z } from "zod";

export const adminUsersQuerySchema = z.object({
  query: z.object({
    pageParam: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(20),
    role: z.enum(["client", "project manager", "admin"]).optional(),
  }),
});

export const adminProjectsQuerySchema = z.object({
  query: z.object({
    pageParam: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(20),
  }),
});

export const deleteUserParamsSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
});
