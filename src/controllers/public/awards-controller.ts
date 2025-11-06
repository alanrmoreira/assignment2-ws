import { Request, Response } from "express";
import { awardsService } from "../../services/awards-service";

export const publicAwardsController = {
    listByEventEdition: async (req: Request, res: Response) => {
        const eventEditionId = Number(req.params.event_id);
        const result = await awardsService.list(eventEditionId);
        res.json(result);
    }
};