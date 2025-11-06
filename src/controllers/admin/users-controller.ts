import { Request, Response } from "express";
import { usersService } from "../../services/users-service";
import { UserCreateSchema, UserUpdateSchema } from "../../types/users-dto";

export const list = async (_req: Request, res: Response) => {
    const users = await usersService.list();
    res.json(users);
};

export const get = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await usersService.get(id);
    res.json(user);
};

export const create = async (req: Request, res: Response) => {
    const parsed = UserCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const user = await usersService.create(parsed.data);
    res.status(201).json(user);
};

export const update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = UserUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const user = await usersService.update(id, parsed.data);
    res.json(user);
};

export const remove = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await usersService.remove(id);
    res.json(result);
};