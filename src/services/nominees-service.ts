import { AppError } from "../errors/app-error";
import * as usersRepo from "../repositories/users-in-event-repo";
import * as awardsRepo from "../repositories/awards-repo";
import * as nomineesRepo from "../repositories/nominees-repo";

export type BulkNominationInput = {
    event_edition_id: number;
    nominator_sait_id: string;
    nominations: Array<{
        award_id: number;
        user_in_event_id?: number;
        nominee_user_in_event_id?: number;
    }>;
};

export const nomineesService = {
    async listByEdition(eventEditionId: number) {
        return nomineesRepo.listByEdition(eventEditionId);
    },

    async bulkCreate(input: BulkNominationInput) {
        const { event_edition_id, nominator_sait_id } = input;
        const raw = Array.isArray(input.nominations) ? input.nominations : [];

        if (!event_edition_id || !nominator_sait_id) {
            throw new AppError(400, "event_edition_id and nominator_sait_id are required");
        }
        if (!raw.length) {
            throw new AppError(400, "nominations must be a non-empty array");
        }

        const nominator = await usersRepo.findBySaitInEdition(event_edition_id, nominator_sait_id);
        if (!nominator) throw new AppError(404, "Nominator not found for this event edition");
        if (nominator.user_permission !== "vote") {
            throw new AppError(403, "Nominator must have 'vote' permission");
        }

        const alreadySubmitted = await nomineesRepo.hasAnyByNominatorInEdition(event_edition_id, nominator.id);
        if (alreadySubmitted) {
            throw new AppError(409, "This nominator has already submitted nominations for this event edition");
        }

        const normalized = raw
            .map(n => ({
                award_id: Number(n.award_id),
                user_in_event_id: Number(n.user_in_event_id ?? n.nominee_user_in_event_id),
            }))
            .filter(n => Number.isFinite(n.award_id) && Number.isFinite(n.user_in_event_id));

        if (!normalized.length) {
            throw new AppError(400, "Invalid nominations payload");
        }

        const nomineeIds = [...new Set(normalized.map(n => n.user_in_event_id))];
        const awardIds   = [...new Set(normalized.map(n => n.award_id))];

        const nominees = await usersRepo.findByIdsInEdition(event_edition_id, nomineeIds);
        const nomineesMap = new Map(nominees.map(u => [u.id, u]));
        const missingNominees = nomineeIds.filter(id => !nomineesMap.has(id));
        if (missingNominees.length) {
            throw new AppError(400, "Some nominees are not in this event edition");
        }
        const invalidNominees = nominees.filter(u => !["vote", "submit"].includes(u.user_permission));
        if (invalidNominees.length) {
            throw new AppError(400, "Some nominees are not eligible (need 'vote' or 'submit')");
        }

        const awards = await Promise.all(awardIds.map(id => awardsRepo.getById(id)));
        const wrongAwards = awards.filter(a => !a || a.event_edition_id !== event_edition_id);
        if (wrongAwards.length) {
            throw new AppError(400, "Some awards do not belong to this event edition");
        }

        const existingForNominator = await nomineesRepo.findExistingByNominator(
            nominator.id,
            awardIds,
            nomineeIds,
        );
        const existingKey = new Set(
            existingForNominator.map(p => `${p.award_id}:${p.user_in_event_id}:${p.nominator_user_in_event_id}`),
        );

        const toInsert = normalized
            .filter(p => !existingKey.has(`${p.award_id}:${p.user_in_event_id}:${nominator.id}`))
            .map(p => ({
                award_id: p.award_id,
                user_in_event_id: p.user_in_event_id,
                nominator_user_in_event_id: nominator.id,
            }));

        if (!toInsert.length) {
            return { created: 0, skipped: normalized.length, details: "All nominations already existed for this nominator" };
        }

        const { count } = await nomineesRepo.bulkCreate(toInsert);
        return { created: count, skipped: normalized.length - count };
    },

    async nominationCounts(eventEditionId: number, awardId?: number) {
        const awardIds = awardId
            ? [awardId]
            : (await awardsRepo.listByEdition(eventEditionId)).map(a => a.id);

        if (!awardIds.length) {
            return { event_edition_id: eventEditionId, awards: [] };
        }

        const grouped = await nomineesRepo.countsByAwards(awardIds);

        const nomineeIds = [...new Set(grouped.map(g => g.user_in_event_id))];
        const [awards, users] = await Promise.all([
            Promise.all(awardIds.map(id => awardsRepo.getById(id))),
            usersRepo.findByIdsInEdition(eventEditionId, nomineeIds),
        ]);

        const awardsMap = new Map(awards.filter(Boolean).map(a => [a!.id, a!]));
        const usersMap  = new Map(users.map(u => [u.id, u]));

        const byAward = new Map<number, Array<{
            user_in_event_id: number;
            user_name: string;
            user_email: string;
            count: number;
        }>>();

        for (const row of grouped) {
            const list = byAward.get(row.award_id) ?? [];
            const u = usersMap.get(row.user_in_event_id);
            list.push({
                user_in_event_id: row.user_in_event_id,
                user_name: u?.user_name ?? "(unknown)",
                user_email: u?.user_email ?? "",
                count: row._count._all,
            });
            byAward.set(row.award_id, list);
        }

        const awardsOut = [...byAward.entries()].map(([aid, totals]) => {
            const a = awardsMap.get(aid);
            totals.sort((a, b) => b.count - a.count || a.user_name.localeCompare(b.user_name));
            const totalForAward = totals.reduce((acc, t) => acc + t.count, 0);
            return {
                award_id: aid,
                award_category_name: a?.category_name ?? "(unknown)",
                totals,
                total_nominations_for_award: totalForAward,
            };
        }).sort((x, y) => {
            const ax = awardsMap.get(x.award_id)?.category_name ?? "";
            const ay = awardsMap.get(y.award_id)?.category_name ?? "";
            return ax.localeCompare(ay);
        });

        return {
            event_edition_id: eventEditionId,
            awards: awardsOut,
        };
    },
};