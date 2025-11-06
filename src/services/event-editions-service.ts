import { AppError } from "../errors/app-error";
import * as editionsRepo from "../repositories/event-editions-repo";
import * as usersRepo from "../repositories/users-in-event-repo";
import type { UsersInEventCreate } from "../repositories/users-in-event-repo";
import { parseUsersCsv } from "../utils/parse-users-csv";
import * as submissionsReadRepo from "../repositories/submissions-read-repo";
import {WindowStatus} from "../enums/voting-window-enum";


function getWindowStatus(start: Date, end: Date, now = new Date()): WindowStatus {
    const s = new Date(start);
    const e = new Date(end);
    if (now < s) return WindowStatus.NOT_STARTED;
    if (now > e) return WindowStatus.CLOSED;
    return WindowStatus.OPENED;
}

export const eventEditionsService = {
    async list() {
        return editionsRepo.list();
    },

    async get(id: number) {
        const ed = await editionsRepo.getById(id);
        if (!ed) throw new AppError(404, "Event edition not found");
        return ed;
    },

    async create(input: {
        year: number;
        submissions_start: string;
        submissions_end: string;
        votes_start: string;
        votes_end: string;
    }) {
        const exists = await editionsRepo.getByYear(input.year);
        if (exists) throw new AppError(409, "Year already exists");
        return editionsRepo.create({
            ...input,
            submissions_start: new Date(input.submissions_start),
            submissions_end: new Date(input.submissions_end),
            votes_start: new Date(input.votes_start),
            votes_end: new Date(input.votes_end),
        });
    },

    async update(
        id: number,
        input: {
            year: number;
            submissions_start: string;
            submissions_end: string;
            votes_start: string;
            votes_end: string;
        }
    ) {
        const ed = await editionsRepo.getById(id);
        if (!ed) throw new AppError(404, "Event edition not found");

        const byYear = await editionsRepo.getByYear(input.year);
        if (byYear && byYear.id !== id) throw new AppError(409, "Year already exists");

        return editionsRepo.update(id, {
            year: input.year,
            submissions_start: new Date(input.submissions_start),
            submissions_end: new Date(input.submissions_end),
            votes_start: new Date(input.votes_start),
            votes_end: new Date(input.votes_end),
        });
    },

    async patch(
        id: number,
        input: Partial<{
            year: number;
            submissions_start: string;
            submissions_end: string;
            votes_start: string;
            votes_end: string;
        }>
    ) {
        const ed = await editionsRepo.getById(id);
        if (!ed) throw new AppError(404, "Event edition not found");

        if (input.year !== undefined) {
            const byYear = await editionsRepo.getByYear(input.year);
            if (byYear && byYear.id !== id) throw new AppError(409, "Year already exists");
        }

        const payload: any = {};
        if (input.year !== undefined) payload.year = input.year;
        if (input.submissions_start) payload.submissions_start = new Date(input.submissions_start);
        if (input.submissions_end)   payload.submissions_end   = new Date(input.submissions_end);
        if (input.votes_start)       payload.votes_start       = new Date(input.votes_start);
        if (input.votes_end)         payload.votes_end         = new Date(input.votes_end);

        return editionsRepo.update(id, payload);
    },

    async remove(id: number) {
        const ed = await editionsRepo.getById(id);
        if (!ed) throw new AppError(404, "Event edition not found");
        await editionsRepo.remove(id);
        return { deleted: true };
    },

    async importUsersCsv(eventEditionId: number, csvBuffer: Buffer) {
        const ed = await editionsRepo.getById(eventEditionId);
        if (!ed) throw new AppError(404, "Event edition not found");

        const rows = parseUsersCsv(csvBuffer);

        const allowed = new Set(["vote", "submit", "vote_external"]);
        const seen = new Set<string>();
        const validRows: UsersInEventCreate[] = [];
        const skipped: Array<{ row: number; email?: string; reason: string }> = [];

        rows.forEach((r, idx) => {
            const rowNum = idx + 2;
            const email = r.user_email?.trim().toLowerCase();
            const name = r.user_name?.trim();
            const sait = r.user_sait_id?.trim();
            const perm = r.user_permission?.trim().toLowerCase();

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                skipped.push({ row: rowNum, reason: "Invalid email" });
                return;
            }
            if (!name) {
                skipped.push({ row: rowNum, email, reason: "Missing user_name" });
                return;
            }
            if (!perm || !allowed.has(perm)) {
                skipped.push({ row: rowNum, email, reason: "Invalid user_permission" });
                return;
            }
            if (seen.has(email)) {
                skipped.push({ row: rowNum, email, reason: "Duplicated in CSV" });
                return;
            }
            seen.add(email);
            validRows.push({
                user_name: name,
                user_email: email,
                user_sait_id: sait ?? null,
                user_permission: perm,
            });
        });

        const emails = validRows.map((r) => r.user_email);
        const existing = await usersRepo.findByEmails(eventEditionId, emails);
        const existingSet = new Set(existing.map((u) => u.user_email.toLowerCase()));

        const toCreate = validRows.filter((r) => !existingSet.has(r.user_email));
        const willSkip = validRows
            .filter((r) => existingSet.has(r.user_email))
            .map((r) => ({ row: -1, email: r.user_email, reason: "Already registered for this edition" }));

        const createdCount = await usersRepo.bulkCreate(eventEditionId, toCreate);

        return {
            event_edition_id: eventEditionId,
            created: createdCount,
            skipped: skipped.concat(willSkip),
            total_rows: rows.length,
            processed: toCreate.length + willSkip.length,
        };
    },

    async publicCurrent() {
        const now = new Date();
        const year = now.getFullYear();
        const edition = await editionsRepo.getByYear(year);
        if (!edition) throw new AppError(404, "Event edition for current year not found");

        const submissions = getWindowStatus(edition.submissions_start, edition.submissions_end, now);
        const votes = getWindowStatus(edition.votes_start, edition.votes_end, now);

        const submissionsEnded = now > new Date(edition.submissions_end);
        const votesEnded = now > new Date(edition.votes_end);

        if (submissionsEnded && votesEnded) {
            const winners = await submissionsReadRepo.listWinnersByEditionYear(edition.id, edition.year);
            return {
                year: edition.year,
                submissions,
                votes,
                winners
            };
        }

        return {
            year: edition.year,
            submissions,
            votes
        };
    }
};