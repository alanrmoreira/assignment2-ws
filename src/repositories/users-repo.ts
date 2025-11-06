import { prisma } from "../db/prisma";

const userPublicSelect = {
    id: true,
    name: true,
    email: true,
    role_id: true,
    created_at: true,
    updated_at: true
};

export const usersRepo = {
    list() {
        return prisma.user.findMany({
            orderBy: { id: "asc" },
            select: userPublicSelect
        });
    },

    getById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: userPublicSelect
        });
    },

    getByEmailRaw(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    create(data: { name: string; email: string; password: string; role_id: number }) {
        return prisma.user.create({
            data,
            select: userPublicSelect
        });
    },

    update(id: number, data: Partial<{ name: string; email: string; password: string; role_id: number }>) {
        return prisma.user.update({
            where: { id },
            data,
            select: userPublicSelect
        });
    },

    remove(id: number) {
        return prisma.user.delete({ where: { id } });
    },

    roleExists(role_id: number) {
        return prisma.role.findUnique({ where: { id: role_id } });
    }
};