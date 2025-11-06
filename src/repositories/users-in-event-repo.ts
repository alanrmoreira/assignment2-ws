import { prisma } from "../db/prisma";

export type UsersInEventCreate = {
    user_name: string;
    user_email: string;
    user_sait_id: string | null;
    user_permission: string;
};

export function findByEmails(eventEditionId: number, emails: string[]) {
    if (emails.length === 0) return Promise.resolve([]);
    return prisma.usersInEvent.findMany({
        where: { event_edition_id: eventEditionId, user_email: { in: emails } },
        select: { id: true, user_email: true },
    });
}

export async function bulkCreate(eventEditionId: number, rows: UsersInEventCreate[]) {
    if (rows.length === 0) return 0;
    const result = await prisma.usersInEvent.createMany({
        data: rows.map((r) => ({
            event_edition_id: eventEditionId,
            user_name: r.user_name,
            user_email: r.user_email,
            user_sait_id: r.user_sait_id,
            user_permission: r.user_permission,
        })),
        skipDuplicates: true,
    });
    return result.count;
}

export async function findByIdsInEdition(eventEditionId: number, ids: number[]) {
    const list = (ids ?? [])
        .map(n => Number(n))
        .filter(n => Number.isFinite(n));

    if (list.length === 0) return [];
    return prisma.usersInEvent.findMany({
        where: { event_edition_id: eventEditionId, id: { in: list } },
    });
}

export async function findBySaitInEdition(eventEditionId: number, user_sait_id: string) {
    return prisma.usersInEvent.findFirst({
        where: { event_edition_id: eventEditionId, user_sait_id },
    });
}

export async function listSubmittersByEdition(eventEditionId: number) {
    return prisma.usersInEvent.findMany({
        where: {
            event_edition_id: eventEditionId,
            user_permission: "submit"
        },
        orderBy: [{ user_name: "asc" }, { user_email: "asc" }]
    });
}