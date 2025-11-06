import { Request, Response } from "express";
import { csrfService } from "../../services/csrf-service";

export const csrfController = {
    token: async (req: Request, res: Response) => {
        const csrf = csrfService.issue(req);
        res.status(200).json({ csrf });
    },

    validate: async (req: Request, res: Response) => {
        csrfService.validate(req);
        res.status(200).json({ ok: true });
    }
};