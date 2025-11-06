import { prisma } from "../db/prisma";

export function hasVoteForAward(voter_user_in_event_id: number, award_id: number) {
    return prisma.nomineeVote.findFirst({
        where: {
            voter_user_in_event_id,
            nominee: { award_id }
        },
        select: { id: true }
    }).then(r => !!r);
}

export function hasAnyVoteByVoter(voter_user_in_event_id: number) {
    return prisma.nomineeVote.findFirst({
        where: { voter_user_in_event_id },
        select: { id: true }
    }).then(r => !!r);
}

export function createMany(data: Array<{ nominee_id: number; voter_user_in_event_id: number }>) {
    return prisma.nomineeVote.createMany({
        data,
        skipDuplicates: true
    });
}