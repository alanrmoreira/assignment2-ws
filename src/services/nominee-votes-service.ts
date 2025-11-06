import { AppError } from "../errors/app-error";
import * as usersRepo from "../repositories/users-in-event-repo";
import * as awardsRepo from "../repositories/awards-repo";
import * as nomineesRepo from "../repositories/nominees-repo";
import * as votesRepo from "../repositories/nominee-votes-repo";

export type NomineeVoteItem = {
    nominee_id: number;
    award_id: number;
};

export type NomineeVotesBulkInput = {
    user_sait_id: string;
    votes: NomineeVoteItem[];
};

export const nomineeVotesService = {
    async bulk(input: NomineeVotesBulkInput) {
        if (!input || typeof input !== "object") {
            throw new AppError(400, "Payload must be an object");
        }

        const user_sait_id = (input.user_sait_id ?? "").toString().trim();
        const votes = Array.isArray(input.votes) ? input.votes : [];

        if (!user_sait_id) {
            throw new AppError(400, "user_sait_id is required");
        }
        if (votes.length === 0) {
            throw new AppError(400, "votes must be a non-empty array");
        }

        const normalized = votes.map((v, idx) => ({
            idx,
            nominee_id: Number((v as any)?.nominee_id),
            award_id: Number((v as any)?.award_id),
        })).filter(v => Number.isFinite(v.nominee_id) && Number.isFinite(v.award_id));

        if (!normalized.length) {
            throw new AppError(400, "Invalid votes payload");
        }

        const awardIds = [...new Set(normalized.map(v => v.award_id))];
        const awards = await Promise.all(awardIds.map(id => awardsRepo.getById(id)));
        const awardsMap = new Map(awards.filter(Boolean).map(a => [a!.id, a!]));
        if (awardsMap.size !== awardIds.length) {
            throw new AppError(400, "Some awards not found");
        }

        const duplicatesByAward = new Map<number, Set<number>>();
        for (const v of normalized) {
            const set = duplicatesByAward.get(v.award_id) ?? new Set<number>();
            set.add(v.nominee_id);
            duplicatesByAward.set(v.award_id, set);
        }
        for (const [aid, set] of duplicatesByAward.entries()) {
            if (set.size > 1) throw new AppError(400, `Only one nominee per award is allowed (award_id=${aid})`);
        }

        const nomineeIds = [...new Set(normalized.map(v => v.nominee_id))];
        const nominees = await Promise.all(nomineeIds.map(id => nomineesRepo.getById(id)));
        const nomineesMap = new Map(nominees.filter(Boolean).map(n => [n!.id, n!]));
        if (nomineesMap.size !== nomineeIds.length) {
            throw new AppError(400, "Some nominees not found");
        }

        for (const v of normalized) {
            const n = nomineesMap.get(v.nominee_id)!;
            if (n.award_id !== v.award_id) {
                throw new AppError(400, `Nominee does not belong to the given award (nominee_id=${v.nominee_id}, award_id=${v.award_id})`);
            }
        }

        let voterUserInEventId: number | null = null;

        for (const v of normalized) {
            const award = awardsMap.get(v.award_id)!;
            const editionId = award.event_edition_id;

            const voter = await usersRepo.findBySaitInEdition(editionId, user_sait_id);
            if (!voter) {
                throw new AppError(404, "Voter not found in this event edition");
            }

            if (!["vote", "submit"].includes(String(voter.user_permission))) {
                throw new AppError(403, "Voter does not have permission to vote");
            }

            if (voterUserInEventId === null) {
                voterUserInEventId = voter.id;
            } else if (voterUserInEventId !== voter.id) {
                throw new AppError(400, "All items must refer to the same voter");
            }
        }

        const voterId = voterUserInEventId!;

        const alreadyAny = await votesRepo.hasAnyVoteByVoter(voterId);
        if (alreadyAny) {
            throw new AppError(409, "Voter already submitted votes");
        }

        for (const v of normalized) {
            const already = await votesRepo.hasVoteForAward(voterId, v.award_id);
            if (already) {
                throw new AppError(409, `Voter already voted for award_id=${v.award_id}`);
            }
        }

        const toInsert = normalized.map(v => ({
            nominee_id: v.nominee_id,
            voter_user_in_event_id: voterId,
        }));

        const { count } = await votesRepo.createMany(toInsert);
        return { created: count };
    },
};