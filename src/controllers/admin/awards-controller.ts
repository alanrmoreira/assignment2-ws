import { Request, Response } from "express";
import { z } from "zod";
import { awardsService } from "../../services/awards-service";

const createSchema = z.object({
    category_name: z.string().min(1).max(120),
    award_name: z.string().min(1).max(120)
});

const updateSchema = createSchema;

const patchSchema = z.object({
    category_name: z.string().min(1).max(120).optional(),
    award_name: z.string().min(1).max(120).optional()
});

export const awardsController = {
    list: async (req: Request, res: Response) => {
        const eventEditionId = Number(req.params.event_id);
        const result = await awardsService.list(eventEditionId);
        res.json(result);
    },

    get: async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const row = await awardsService.get(id);
        res.json(row);
    },

    create: async (req: Request, res: Response) => {
        const eventEditionId = Number(req.params.event_id);
        const body = createSchema.parse(req.body);
        const created = await awardsService.create(eventEditionId, body.category_name, body.award_name);
        res.status(201).json(created);
    },

    update: async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const body = updateSchema.parse(req.body);
        const updated = await awardsService.update(id, { category_name: body.category_name, award_name: body.award_name });
        res.json(updated);
    },

    patch: async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const body = patchSchema.parse(req.body);
        const updated = await awardsService.patch(id, body);
        res.json(updated);
    },

    remove: async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const out = await awardsService.remove(id);
        res.json(out);
    }
};