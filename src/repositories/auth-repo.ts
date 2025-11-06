import { prisma } from "../db/prisma";

export const authRepo = {
    getByEmailWithPassword(email: string) {
        return prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
    },

    async setPassword(userId: number, hashed: string) {
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
    },
};