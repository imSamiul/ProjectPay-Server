import { z } from "zod";

export const signUpSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    password: z.string().min(6),
    userType: z.enum(["client", "project manager"]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});
