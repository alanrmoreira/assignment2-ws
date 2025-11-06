import { Request, Response } from "express";
import { nomineesService } from "../../services/nominees-service";

export const nomineesController = {
    async listByEdition(req: Request, res: Response) {
        const eventEditionId = Number(req.params.id);
        const rows = await nomineesService.listByEdition(eventEditionId);
        res.json(rows);
    },

    async bulkCreate(req: Request, res: Response) {
        const { event_edition_id, nominator_sait_id, nominations } = req.body || {};
        const out = await nomineesService.bulkCreate({
            event_edition_id: Number(event_edition_id),
            nominator_sait_id: String(nominator_sait_id || "").trim(),
            nominations: Array.isArray(nominations) ? nominations : [],
        });
        res.status(201).json(out);
    },

    async countsByAward(req: Request, res: Response) {
        const eventEditionId = Number(req.params.id);
        const awardId = req.query.awardId ? Number(req.query.awardId) : undefined;
        const data = await nomineesService.nominationCounts(eventEditionId, awardId);
        res.json(data);
    },
};