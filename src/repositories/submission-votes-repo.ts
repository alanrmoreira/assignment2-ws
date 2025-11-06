import { prisma } from "../db/prisma";

export function hasVoteForAward(voter_user_in_event_id: number, award_id: number) {
    return prisma.submissionVote.findFirst({
        where: {
            voter_user_in_event_id,
            submission: { award_id }
        },
        select: { id: true }
    }).then(r => !!r);
}

export function hasAnyVoteByVoter(voter_user_in_event_id: number) {
    return prisma.submissionVote.findFirst({
        where: { voter_user_in_event_id },
        select: { id: true }
    }).then(r => !!r);
}

export function createMany(data: Array<{ submission_id: number; voter_user_in_event_id: number }>) {
    return prisma.submissionVote.createMany({
        data,
        skipDuplicates: true
    });
}