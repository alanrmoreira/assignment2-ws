import { prisma } from "../db/prisma";

export function list() {
    return prisma.eventEdition.findMany({
        orderBy: { year: "desc" },
    });
}

export function getById(id: number) {
    return prisma.eventEdition.findUnique({ where: { id } });
}

export function getByYear(year: number) {
    return prisma.eventEdition.findFirst({ where: { year } });
}

export function create(data: {
    year: number;
    submissions_start: Date;
    submissions_end: Date;
    votes_start: Date;
    votes_end: Date;
}) {
    return prisma.eventEdition.create({ data });
}

export function update(id: number, data: Partial<{
    year: number;
    submissions_start: Date;
    submissions_end: Date;
    votes_start: Date;
    votes_end: Date;
}>) {
    return prisma.eventEdition.update({ where: { id }, data });
}

export function remove(id: number) {
    return prisma.eventEdition.delete({ where: { id } });
}