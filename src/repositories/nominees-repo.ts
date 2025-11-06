import { prisma } from "../db/prisma";

export type NomineeCreate = {
    user_in_event_id: number;
    award_id: number;
    nominator_user_in_event_id: number;
};

export async function bulkCreate(rows: NomineeCreate[]) {
    if (!rows.length) return { count: 0 };
    const result = await prisma.nominee.createMany({
        data: rows.map(r => ({
            user_in_event_id: r.user_in_event_id,
            award_id: r.award_id,
            nominator_user_in_event_id: r.nominator_user_in_event_id,
        })),
        skipDuplicates: false,
    });
    return { count: result.count };
}

export async function findExistingByNominator(
    nominatorId: number,
    awardIds: number[],
    nomineeIds: number[],
) {
    if (!awardIds.length || !nomineeIds.length) return [];
    return prisma.nominee.findMany({
        where: {
            nominator_user_in_event_id: nominatorId,
            award_id: { in: awardIds },
            user_in_event_id: { in: nomineeIds },
        },
        select: { award_id: true, user_in_event_id: true, nominator_user_in_event_id: true },
    });
}

export async function listByEdition(eventEditionId: number) {
    return prisma.nominee.findMany({
        where: { award: { event_edition_id: eventEditionId } },
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        include: {
            award: true,
            user_in_event: true,
            nominator: true,
        },
    });
}

export async function hasAnyByNominatorInEdition(
    eventEditionId: number,
    nominatorId: number,
): Promise<boolean> {
    const count = await prisma.nominee.count({
        where: {
            nominator_user_in_event_id: nominatorId,
            award: { event_edition_id: eventEditionId },
        },
    });
    return count > 0;
}

export async function countsByAwards(awardIds: number[]) {
    if (!awardIds.length) return [];
    return prisma.nominee.groupBy({
        by: ["award_id", "user_in_event_id"],
        where: { award_id: { in: awardIds } },
        _count: { _all: true },
    });
}

export async function getById(id: number) {
    return prisma.nominee.findUnique({
        where: { id },
        select: { id: true, award_id: true },
    });
}