import { AppError } from "../errors/app-error";
import * as usersRepo from "../repositories/users-in-event-repo";
import * as awardsRepo from "../repositories/awards-repo";
import * as submissionsReadRepo from "../repositories/submissions-read-repo";
import * as submissionVotesRepo from "../repositories/submission-votes-repo";

export type SubmissionVoteItem = {
    submission_id: number;
    award_id: number;
};

export type SubmissionVotesBulkInput = {
    user_sait_id: string;
    votes: SubmissionVoteItem[];
};

export const submissionVotesService = {
    async bulk(input: SubmissionVotesBulkInput) {
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

        const normalized = votes.map(v => ({
            submission_id: Number((v as any)?.submission_id),
            award_id: Number((v as any)?.award_id),
        })).filter(v => Number.isFinite(v.submission_id) && Number.isFinite(v.award_id));

        if (!normalized.length) {
            throw new AppError(400, "Invalid votes payload");
        }

        const awardIds = [...new Set(normalized.map(v => v.award_id))];
        const awards = await Promise.all(awardIds.map(id => awardsRepo.getById(id)));
        const awardsMap = new Map(awards.filter(Boolean).map(a => [a!.id, a!]));
        if (awardsMap.size !== awardIds.length) {
            throw new AppError(400, "Some awards not found");
        }

        const dup = new Map<number, Set<number>>();
        for (const v of normalized) {
            const s = dup.get(v.award_id) ?? new Set<number>();
            s.add(v.submission_id);
            dup.set(v.award_id, s);
        }
        for (const [aid, set] of dup.entries()) {
            if (set.size > 1) {
                throw new AppError(400, `Only one submission per award is allowed (award_id=${aid})`);
            }
        }

        const submissionIds = [...new Set(normalized.map(v => v.submission_id))];
        const submissions = await submissionsReadRepo.getByIds(submissionIds);
        const subsMap = new Map(submissions.map(s => [s.id, s]));
        if (subsMap.size !== submissionIds.length) {
            throw new AppError(400, "Some submissions not found");
        }

        for (const v of normalized) {
            const s = subsMap.get(v.submission_id)!;
            if (s.award_id !== v.award_id) {
                throw new AppError(400, `Submission does not belong to the given award (submission_id=${v.submission_id}, award_id=${v.award_id})`);
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

            if (String(voter.user_permission) !== "vote_external") {
                throw new AppError(403, "Voter does not have permission to vote on submissions");
            }

            if (voterUserInEventId === null) {
                voterUserInEventId = voter.id;
            } else if (voterUserInEventId !== voter.id) {
                throw new AppError(400, "All items must refer to the same voter");
            }
        }

        const voterId = voterUserInEventId!;

        const alreadyAny = await submissionVotesRepo.hasAnyVoteByVoter(voterId);
        if (alreadyAny) {
            throw new AppError(409, "Voter already submitted votes");
        }

        for (const v of normalized) {
            const already = await submissionVotesRepo.hasVoteForAward(voterId, v.award_id);
            if (already) {
                throw new AppError(409, `Voter already voted for award_id=${v.award_id}`);
            }
        }

        const toInsert = normalized.map(v => ({
            submission_id: v.submission_id,
            voter_user_in_event_id: voterId,
        }));

        const { count } = await submissionVotesRepo.createMany(toInsert);
        return { created: count };
    },
};