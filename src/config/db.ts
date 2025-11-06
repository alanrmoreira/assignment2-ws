import mysql from "mysql2/promise";
import { ENV } from "./env";

export const db = mysql.createPool({
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    user: ENV.DB.USER,
    password: ENV.DB.PASSWORD,
    database: ENV.DB.NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function pingDB(): Promise<boolean> {
    try {
        const conn = await db.getConnection();
        await conn.ping();
        conn.release();
        return true;
    } catch {
        return false;
    }
}