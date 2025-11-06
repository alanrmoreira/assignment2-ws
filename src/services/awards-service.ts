import { AppError } from "../errors/app-error";
import * as awardsRepo from "../repositories/awards-repo";
import * as editionsRepo from "../repositories/event-editions-repo";

export const awardsService = {
    async list(eventEditionId: number) {
        const ed = await editionsRepo.getById(eventEditionId);
        if (!ed) throw new AppError(404, "Event edition not found");
        const awards = await awardsRepo.listByEdition(eventEditionId);
        return { event_id: ed.id, year: ed.year, awards };
    },

    async get(id: number) {
        const row = await awardsRepo.getById(id);
        if (!row) throw new AppError(404, "Award not found");
        return row;
    },

    async create(eventEditionId: number, category_name: string, award_name: string) {
        const ed = await editionsRepo.getById(eventEditionId);
        if (!ed) throw new AppError(404, "Event edition not found");
        const dup = await awardsRepo.getByCategoryAndAwardInEdition(eventEditionId, category_name, award_name);
        if (dup) throw new AppError(409, "Category name already exists for this edition");
        return awardsRepo.create(eventEditionId, category_name, award_name);
    },

    async update(id: number, data: { category_name: string; award_name: string }) {
        const row = await awardsRepo.getById(id);
        if (!row) throw new AppError(404, "Award not found");
        const newCategory = data.category_name ?? row.category_name;
        const newAward = data.award_name ?? row.award_name;
        const dup = await awardsRepo.getByCategoryAndAwardInEdition(row.event_edition_id, newCategory, newAward);
        if (dup && dup.id !== row.id) throw new AppError(409, "Category name already exists for this edition");
        return awardsRepo.update(id, { category_name: data.category_name, award_name: data.award_name });
    },

    async patch(id: number, data: Partial<{ category_name: string; award_name: string }>) {
        const row = await awardsRepo.getById(id);
        if (!row) throw new AppError(404, "Award not found");
        const newCategory = data.category_name ?? row.category_name;
        const newAward = data.award_name ?? row.award_name;
        const dup = await awardsRepo.getByCategoryAndAwardInEdition(row.event_edition_id, newCategory, newAward);
        if (dup && dup.id !== row.id) throw new AppError(409, "Category name already exists for this edition");
        return awardsRepo.update(id, { ...data });
    },

    async remove(id: number) {
        const row = await awardsRepo.getById(id);
        if (!row) throw new AppError(404, "Award not found");
        await awardsRepo.remove(id);
        return { deleted: true };
    }
};