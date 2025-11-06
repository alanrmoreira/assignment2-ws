import { parse } from "csv-parse/sync";

type Row = {
    user_name?: string;
    user_email?: string;
    user_sait_id?: string;
    user_permission?: string;
};

export function parseUsersCsv(buf: Buffer): Row[] {
    try {
        const text = buf.toString("utf8");
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as Row[];
        return records;
    } catch {
        throw new Error("Invalid CSV");
    }
}