import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const name = "002_add_admin_user";

export async function up() {
    const adminRole = await prisma.role.findFirst({
        where: { role_name: "admin" },
        select: { id: true },
    });

    if (!adminRole) {
        throw new Error("Required role 'admin' not found. Ensure migration 001_add_admin_role ran successfully.");
    }

    const email = "ignite_admin@interactivedesign.ca";

    const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existing) {
        console.log(`Admin user already exists: ${email}`);
        return;
    }

    await prisma.user.create({
        data: {
            name: "Ignite Admin",
            email,
            password: "$2b$12$XHK7ybAgOHWoFSmgjWyBX.n.aOL5l19hfZbE5KecIqNH7BeB2FN/m",
            role_id: adminRole.id,
        },
    });

    console.log(`Added admin user: ${email} with role_id=${adminRole.id}`);
}