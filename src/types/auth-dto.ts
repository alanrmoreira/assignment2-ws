import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(255),
});
export type LoginDTO = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
    email: z.string().email().max(255),
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
    token: z.string().min(10),
    new_password: z.string().min(8).max(255),
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;