import { Request, Response } from "express";
import { z } from "zod";
import { eventEditionsService } from "../../services/event-editions-service";

const baseSchema = z.object({
    year: z.number().int().min(1900).max(3000),
    submissions_start: z.string().datetime(),
    submissions_end: z.string().datetime(),
    votes_start: z.string().datetime(),
    votes_end: z.string().datetime(),
});

export async function list(_req: Request, res: Response) {
    const data = await eventEditionsService.list();
    res.json(data);
}

export async function get(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await eventEditionsService.get(id);
    res.json(data);
}

export async function create(req: Request, res: Response) {
    const parsed = baseSchema.parse(req.body);
    const created = await eventEditionsService.create(parsed);
    res.status(201).json(created);
}

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const parsed = baseSchema.parse(req.body);
    const updated = await eventEditionsService.update(id, parsed);
    res.json(updated);
}

export async function patch(req: Request, res: Response) {
    const id = Number(req.params.id);
    const partial = z
        .object({
            year: z.number().int().min(1900).max(3000).optional(),
            submissions_start: z.string().datetime().optional(),
            submissions_end: z.string().datetime().optional(),
            votes_start: z.string().datetime().optional(),
            votes_end: z.string().datetime().optional(),
        })
        .refine((v) => Object.keys(v).length > 0, "At least one field is required")
        .parse(req.body);

    const updated = await eventEditionsService.patch(id, partial);
    res.json(updated);
}

export async function remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const out = await eventEditionsService.remove(id);
    res.json(out);
}

export async function uploadCsv(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!req.file || !req.file.buffer?.length) {
        return res.status(400).json({ error: "CSV file is required" });
    }
    const result = await eventEditionsService.importUsersCsv(id, req.file.buffer);
    res.json(result);
}