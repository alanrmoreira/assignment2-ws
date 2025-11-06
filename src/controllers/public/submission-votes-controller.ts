import { Request, Response } from "express";
import { submissionVotesService } from "../../services/submission-votes-service";

export const submissionVotesController = {
    async bulk(req: Request, res: Response) {
        const payload = typeof req.body === "object" && req.body ? req.body : {};
        const result = await submissionVotesService.bulk(payload);
        res.status(201).json(result);
    },
};