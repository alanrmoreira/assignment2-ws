import { Request, Response } from "express";
import { eventEditionsService } from "../../services/event-editions-service";

export const editionController = {
    async current(_req: Request, res: Response) {
        const data = await eventEditionsService.publicCurrent();
        return res.status(200).json(data);
    },
};