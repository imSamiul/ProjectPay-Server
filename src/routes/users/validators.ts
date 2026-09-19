import { z } from "zod";

export const signUpSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().min(1).optional(),
      password: z.string().min(6),
      userType: z.enum(["client", "project manager"]),
    })
    .refine((data) => Boolean(data.email || data.phone), {
      message: "Either email or phone is required",
      path: ["email"],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1),
    password: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    phone: z.string().trim().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
