import { z } from "zod";

export const UserCreateSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(255),
    password: z.string().min(8).max(255),
    role_id: z.number().int().positive()
});
export type UserCreateDTO = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = z.object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().max(255).optional(),
    password: z.string().min(8).max(255).optional(),
    role_id: z.number().int().positive().optional()
}).refine(d => Object.keys(d).length > 0, { message: "No fields to update" });
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;