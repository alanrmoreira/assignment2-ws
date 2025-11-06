import { z } from "zod";

export const RoleCreateSchema = z.object({
    role_name: z.string().min(2).max(50),
});

export type RoleCreateDTO = z.infer<typeof RoleCreateSchema>;

export const RoleUpdateSchema = z.object({
    role_name: z.string().min(2).max(50),
});

export type RoleUpdateDTO = z.infer<typeof RoleUpdateSchema>;