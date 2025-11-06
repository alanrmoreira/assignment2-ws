import { Request, Response } from "express";
import { submissionsService } from "../../services/submissions-service";

export const detail = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const sub = await submissionsService.getOne(id);
    if (!sub) return res.status(404).json({ error: "Not found" });
    res.json(sub);
};

export const review = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status, note } = req.body as {
        status: "approved" | "rejected" | "pending";
        note?: string | null;
    };

    const reviewer_user_id = Number((req as any).user?.sub) || null;

    const updated = await submissionsService.review(id, reviewer_user_id, status, note ?? null);
    res.json({
        id: updated.id,
        status: updated.status,
        reviewed_by_user_id: updated.reviewed_by_user_id,
        reviewed_at: updated.reviewed_at,
    });
};
