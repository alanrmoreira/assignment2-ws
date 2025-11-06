import { Request, Response } from "express";
import { rolesService } from "../../services/roles-service";
import { RoleCreateSchema, RoleUpdateSchema } from "../../types/roles-dto";

export const list = async (_req: Request, res: Response) => {
    const roles = await rolesService.list();
    res.json(roles);
};

export const get = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const role = await rolesService.get(id);
    res.json(role);
};

export const create = async (req: Request, res: Response) => {
    const parsed = RoleCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const role = await rolesService.create(parsed.data.role_name);
    res.status(201).json(role);
};

export const update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = RoleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const role = await rolesService.update(id, parsed.data.role_name);
    res.json(role);
};

export const remove = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await rolesService.remove(id);
    res.json(result);
};