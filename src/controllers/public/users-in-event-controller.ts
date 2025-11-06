import { Request, Response } from "express";
import { publicUsersInEventService } from "../../services/users-in-event-service";

export const publicUsersInEventController = {
    async listSubmitters(req: Request, res: Response) {
        const eventEditionId = Number(req.params.event_edition_id);
        const rows = await publicUsersInEventService.listSubmitters(eventEditionId);
        res.json(rows);
    }
};