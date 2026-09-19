import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    budget: z.coerce.number().nonnegative(),
    advance: z.coerce.number().nonnegative(),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    demoLink: z.string().optional().default(""),
    typeOfWeb: z.string().optional().default(""),
    description: z.string().optional().default(""),
    status: z.boolean().optional().default(false),
  }),
});

export const updateProjectStatusSchema = z.object({
  params: z.object({
    projectCode: z.string().min(1),
  }),
  body: z.object({
    status: z.boolean(),
  }),
});

export const updateProjectDetailsSchema = z.object({
  params: z.object({
    projectCode: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    budget: z.coerce.number().nonnegative().optional(),
    advance: z.coerce.number().nonnegative().optional(),
    endDate: z.string().min(1).optional(),
    demoLink: z.string().optional(),
    typeOfWeb: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const projectCodeParamsSchema = z.object({
  params: z.object({
    projectCode: z.string().min(1),
  }),
});

export const projectIdParamsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
});

export const searchProjectSchema = z.object({
  query: z.object({
    q: z.string().min(1),
    pageParam: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(20),
  }),
});

export const linkClientSchema = z.object({
  params: z.object({
    projectCode: z.string().min(1),
  }),
  body: z.object({
    clientKey: z.string().min(1),
  }),
});

export const unlinkClientSchema = z.object({
  params: z.object({
    projectCode: z.string().min(1),
    clientId: z.string().min(1),
  }),
});
