import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const name = "001_add_admin_role";

export async function up() {
    const exists = await prisma.role.findFirst({
        where: { role_name: "admin" },
    });

    if (!exists) {
        await prisma.role.create({
            data: { role_name: "admin" },
        });
        console.log("Added role: admin");
    } else {
        console.log("Role 'admin' already exists");
    }
}