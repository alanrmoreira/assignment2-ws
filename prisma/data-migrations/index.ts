import { PrismaClient } from "@prisma/client";

type RowCnt = { cnt: bigint | number };

const prisma = new PrismaClient();

const n = (x: unknown) => Number(x ?? 0);

async function ensureDataMigrationsTable() {
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`_data_migrations\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`key\` VARCHAR(191) NOT NULL UNIQUE,
      \`applied_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    const keyCol = await prisma.$queryRawUnsafe<RowCnt[]>(
        `SELECT COUNT(*) AS cnt
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name   = '_data_migrations'
       AND column_name  = 'key'`
    );
    if (n(keyCol[0]?.cnt) === 0) {
        await prisma.$executeRawUnsafe(
            `ALTER TABLE \`_data_migrations\` ADD COLUMN \`key\` VARCHAR(191) NOT NULL`
        );
    }

    const appliedCol = await prisma.$queryRawUnsafe<RowCnt[]>(
        `SELECT COUNT(*) AS cnt
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name   = '_data_migrations'
       AND column_name  = 'applied_at'`
    );
    if (n(appliedCol[0]?.cnt) === 0) {
        await prisma.$executeRawUnsafe(
            `ALTER TABLE \`_data_migrations\` ADD COLUMN \`applied_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`
        );
    }

    const uniqIdx = await prisma.$queryRawUnsafe<RowCnt[]>(
        `SELECT COUNT(*) AS cnt
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = '_data_migrations'
       AND index_name   IN ('key', 'uniq_key', '_data_migrations_key_uq')`
    );
    if (n(uniqIdx[0]?.cnt) === 0) {
        await prisma.$executeRawUnsafe(
            `ALTER TABLE \`_data_migrations\` ADD UNIQUE INDEX \`uniq_key\` (\`key\`)`
        );
    }
}

async function alreadyApplied(key: string): Promise<boolean> {
    const rows = await prisma.$queryRawUnsafe<RowCnt[]>(
        `SELECT COUNT(*) AS cnt FROM \`_data_migrations\` WHERE \`key\` = ? LIMIT 1`,
        key
    );
    return n(rows[0]?.cnt) > 0;
}

async function markApplied(key: string) {
    await prisma.$executeRawUnsafe(
        `INSERT IGNORE INTO \`_data_migrations\` (\`key\`) VALUES (?)`,
        key
    );
}

async function ensureAdminRole() {
    const KEY = "role:admin";
    if (await alreadyApplied(KEY)) return;
    const role = await prisma.role.findFirst({ where: { role_name: "admin" } });
    if (!role) {
        await prisma.role.create({ data: { role_name: "admin" } });
    }
    await markApplied(KEY);
}

async function ensureAdminUser() {
    const KEY = "user:ignite_admin@interactivedesign.ca";
    if (await alreadyApplied(KEY)) return;

    const adminRole = await prisma.role.findFirst({
        where: { role_name: "admin" },
        select: { id: true }
    });

    if (!adminRole) {
        throw new Error("Required role 'admin' not found. Run role migration first.");
    }

    const email = "ignite_admin@interactivedesign.ca";

    const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
    });

    if (!existing) {
        await prisma.user.create({
            data: {
                name: "Ignite Admin",
                email,
                password: "$2b$12$XHK7ybAgOHWoFSmgjWyBX.n.aOL5l19hfZbE5KecIqNH7BeB2FN/m",
                role_id: adminRole.id
            }
        });
    }

    await markApplied(KEY);
}

async function main() {
    await ensureDataMigrationsTable();
    await ensureAdminRole();
    await ensureAdminUser();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (err) => {
        await prisma.$disconnect();
        process.exit(1);
    });