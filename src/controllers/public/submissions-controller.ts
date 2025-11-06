import type { Request, Response } from "express";
import submissionsService from "../../services/submissions-service";

export const list = async (req: Request, res: Response) => {
    const event_edition_id = req.query.event_edition_id ? Number(req.query.event_edition_id) : undefined;
    const award_id = req.query.award_id ? Number(req.query.award_id) : undefined;
    const status = req.query.status ? (String(req.query.status) as "pending" | "approved" | "rejected") : undefined;
    const data = await submissionsService.listByApprovalStatus({ event_edition_id, award_id, status });
    res.json(data);
};

export const submit = async (req: Request, res: Response) => {
    const {
        award_id,
        owner_user_in_event_id,
        is_group_submission,
        contact_name,
        contact_email,
        project_title,
        project_description,
        project_url,
        members_user_in_event_ids,
    } = req.body as any;

    const membersParsed: number[] = Array.isArray(members_user_in_event_ids)
        ? (members_user_in_event_ids as (string | number)[]).map((v) => Number(v)).filter(Number.isFinite)
        : typeof members_user_in_event_ids === "string"
            ? members_user_in_event_ids.split(",").map((s) => Number(s.trim())).filter(Number.isFinite)
            : [];

    const coverFile: Express.Multer.File | undefined = (req as any).files?.cover_image?.[0];
    const files: Express.Multer.File[] = ((req as any).files?.files as Express.Multer.File[]) ?? [];

    const created = await submissionsService.submit({
        award_id: Number(award_id),
        owner_user_in_event_id: Number(owner_user_in_event_id),
        is_group_submission: String(is_group_submission) === "true",
        contact_name: String(contact_name),
        contact_email: String(contact_email),
        project_title: String(project_title),
        project_description: String(project_description),
        project_url: project_url ? String(project_url) : null,
        cover_image_file: coverFile ?? null,
        members_user_in_event_ids: membersParsed,
        files,
    });

    return res.status(201).json(created);
};