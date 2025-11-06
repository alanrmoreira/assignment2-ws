import { ENV } from "../src/config/env";
import mysql from "mysql2/promise";

type Conn = {
    host: string;
    port: number;
    user: string;
    password: string;
    dbName: string;
};

function getConnFromEnv(): Conn {
    if (ENV.DATABASE_URL) {
        try {
            const url = new URL(ENV.DATABASE_URL);
            const dbName = (url.pathname || "").replace(/^\//, "");
            const host = url.hostname || "127.0.0.1";
            const port = Number(url.port || "3306");
            const user = decodeURIComponent(url.username || "root");
            const password = decodeURIComponent(url.password || "");
            if (!dbName) throw new Error("DATABASE_URL is missing database name");
            return { host, port, user, password, dbName };
        } catch (e) {
            console.error("Invalid DATABASE_URL:", e);
        }
    }

    // fallback to ENV.DB
    return {
        host: ENV.DB.HOST,
        port: ENV.DB.PORT,
        user: ENV.DB.USER,
        password: ENV.DB.PASSWORD,
        dbName: ENV.DB.NAME,
    };
}

async function main() {
    const { host, port, user, password, dbName } = getConnFromEnv();

    const conn = await mysql.createConnection({
        host,
        port,
        user,
        password,
        multipleStatements: true,
    });

    try {
        await conn.query(
            `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`
        );
        console.log(`Database ensured: ${dbName} (host=${host} port=${port} user=${user})`);
    } finally {
        await conn.end();
    }
}

main().catch((err) => {
    console.error("Failed to ensure database:", err);
    process.exit(1);
});