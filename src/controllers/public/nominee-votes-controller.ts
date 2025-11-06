import { Request, Response } from "express";
import { nomineeVotesService } from "../../services/nominee-votes-service";

export const nomineeVotesController = {
    async bulk(req: Request, res: Response) {
        const payload = typeof req.body === "object" && req.body ? req.body : {};
        const result = await nomineeVotesService.bulk(payload);
        res.status(201).json(result);
    },
};