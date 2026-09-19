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

export const userIdParamsSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
});

export const createAdminSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, "Name is required"),
      email: z.string().email("Invalid email").optional(),
      phone: z.string().min(1, "Phone is required").optional(),
      password: z.string().min(6, "Password must be at least 6 characters"),
    })
    .refine((data) => Boolean(data.email || data.phone), {
      message: "Either email or phone is required",
      path: ["email"],
    }),
});

export const updateAdminSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      email: z.string().email("Invalid email").optional(),
      phone: z.string().trim().min(1).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field (name, email, phone) must be provided to update",
    }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z.object({
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

