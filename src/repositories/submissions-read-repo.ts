import { prisma } from "../db/prisma";

export function getByIds(ids: number[]) {
    const list = (ids ?? []).map((n) => Number(n)).filter((n) => Number.isFinite(n));
    if (!list.length) return Promise.resolve([]);
    return prisma.submission.findMany({
        where: { id: { in: list } },
        select: { id: true, award_id: true },
    });
}

export function listWinnersByEditionYear(eventEditionId: number, year: number) {
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const nextYear = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));
    return prisma.submission.findMany({
        where: {
            winner: true,
            award: { event_edition_id: eventEditionId },
            submission_date: {
                gte: start,
                lt: nextYear,
            },
        },
        orderBy: [{ award_id: "asc" }, { id: "asc" }],
    });
}