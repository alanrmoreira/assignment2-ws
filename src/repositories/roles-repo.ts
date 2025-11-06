import { prisma } from "../db/prisma";

export const rolesRepo = {
    async list() {
        return prisma.role.findMany({
            orderBy: { id: "asc" },
        });
    },

    async getById(id: number) {
        return prisma.role.findUnique({ where: { id } });
    },

    async getByName(role_name: string) {
        return prisma.role.findFirst({ where: { role_name } });
    },

    async create(role_name: string) {
        return prisma.role.create({ data: { role_name } });
    },

    async update(id: number, role_name: string) {
        return prisma.role.update({ where: { id }, data: { role_name } });
    },

    async remove(id: number) {
        return prisma.role.delete({ where: { id } });
    },
};