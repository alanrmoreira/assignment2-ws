import { prisma } from "../db/prisma";

export type AwardRow = {
    id: number;
    event_edition_id: number;
    category_name: string;
    award_name: string;
};

export async function listByEdition(eventEditionId: number): Promise<AwardRow[]> {
    return prisma.award.findMany({
        where: { event_edition_id: eventEditionId },
        orderBy: [{ category_name: "asc" }, { award_name: "asc" }],
        select: {
            id: true,
            event_edition_id: true,
            category_name: true,
            award_name: true
        }
    });
}

export async function getById(id: number): Promise<AwardRow | null> {
    return prisma.award.findUnique({
        where: { id },
        select: {
            id: true,
            event_edition_id: true,
            category_name: true,
            award_name: true
        }
    });
}

export async function getByNameInEdition(eventEditionId: number, category_name: string): Promise<AwardRow | null> {
    return prisma.award.findFirst({
        where: { event_edition_id: eventEditionId, category_name },
        select: {
            id: true,
            event_edition_id: true,
            category_name: true,
            award_name: true
        }
    });
}

export async function getByCategoryAndAwardInEdition(
    eventEditionId: number,
    category_name: string,
    award_name: string
): Promise<AwardRow | null> {
    return prisma.award.findFirst({
        where: { event_edition_id: eventEditionId, category_name, award_name },
        select: {
            id: true,
            event_edition_id: true,
            category_name: true,
            award_name: true
        }
    });
}

export async function create(eventEditionId: number, category_name: string, award_name: string): Promise<AwardRow> {
    return prisma.award.create({
        data: { event_edition_id: eventEditionId, category_name, award_name },
        select: {
            id: true,
            event_edition_id: true,
            category_name: true,
            award_name: true
        }
    });
}

export async function update(
    id: number,
    data: Partial<Pick<AwardRow, "category_name" | "award_name">>
): Promise<AwardRow> {
    return prisma.award.update({
        where: { id },
        data,
        select: {
            id: true,
            event_edition_id: true,
            category_name: true,
            award_name: true
        }
    });
}

export async function remove(id: number): Promise<void> {
    await prisma.award.delete({ where: { id } });
}