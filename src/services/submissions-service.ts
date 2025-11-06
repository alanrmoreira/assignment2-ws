import fs from "node:fs";
import path from "node:path";
import { prisma } from "../db/prisma";
import { submissionsRepo, type AttachFileRow } from "../repositories/submissions-repo";
import { fileUrl } from "../utils/file-lurl";
import { emailService } from "./email-service";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

function ensureDirSync(dir: string) {
    fs.mkdirSync(dir, { recursive: true });
}

async function saveUploadedFileLocal(
    submissionId: number,
    file: Express.Multer.File
): Promise<{ storageKey: string; bytes: number }> {
    const dir = path.join(UPLOADS_ROOT, "submissions", String(submissionId));
    ensureDirSync(dir);
    const safeBase = path.basename(file.originalname || "file");
    const filename = `${Date.now()}-${safeBase}`;
    const absPath = path.join(dir, filename);
    if (file.buffer && file.buffer.length > 0) {
        await fs.promises.writeFile(absPath, file.buffer);
    } else if (file.path) {
        await fs.promises.rename(file.path, absPath);
    } else {
        await fs.promises.writeFile(absPath, Buffer.alloc(0));
    }
    const stat = await fs.promises.stat(absPath);
    const storageKey = path.relative(UPLOADS_ROOT, absPath).split(path.sep).join("/");
    return { storageKey, bytes: stat.size };
}

export type SubmitArgs = {
    award_id: number;
    owner_user_in_event_id: number;
    is_group_submission: boolean;
    contact_name: string;
    contact_email: string;
    project_title: string;
    project_description: string;
    project_url?: string | null;
    cover_image_file?: Express.Multer.File | null;
    members_user_in_event_ids?: number[];
    files?: Express.Multer.File[];
};

export type AdminSubmissionFileDTO = {
    id: number;
    submission_id: number;
    storage_key: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    uploaded_by_user_in_event_id: number;
    url: string;
};

export type AdminSubmissionDetail = {
    id: number;
    award_id: number;
    user_in_event_id: number;
    is_group_submission: boolean;
    contact_name: string;
    contact_email: string;
    project_title: string;
    project_description: string;
    project_cover_image: string | null;
    project_url: string | null;
    status: "pending" | "approved" | "rejected";
    reviewed_by_user_id: number | null;
    reviewed_at: Date | null;
    review_note: string | null;
    winner: boolean;
    submission_date: Date;
    award: { id: number; event_edition_id: number; category_name: string; award_name: string };
    owner: {
        id: number;
        user_name: string;
        user_email: string;
        user_sait_id: string | null;
        event_edition_id: number;
    };
    members: Array<{
        id: number;
        user_in_event_id: number;
        user_in_event: {
            id: number;
            user_name: string;
            user_email: string;
            user_sait_id: string | null;
        };
    }>;
    files: AdminSubmissionFileDTO[];
};

export type MemberBrief = {
    id: number;
    user_name: string;
    user_email: string;
};

export type AdminSubmissionListItem = {
    id: number;
    award: { id: number; event_edition_id: number; category_name: string; award_name: string };
    owner: { id: number; user_name: string; user_email: string };
    project_title: string;
    project_description: string | null;
    project_url: string | null;
    status: "pending" | "approved" | "rejected";
    submission_date: Date;
    counts: { members: number; members_info: MemberBrief[]; files: number; votes: number };
    cover_image: string | null;
    files: Array<{ id: number; original_name: string; mime_type: string; size_bytes: number; url: string }>;
};

export const submissionsService = {
    async submit(args: SubmitArgs) {
        const [award, owner] = await Promise.all([
            prisma.award.findUnique({
                where: { id: args.award_id },
                select: { id: true, event_edition_id: true, category_name: true, award_name: true },
            }),
            prisma.usersInEvent.findUnique({
                where: { id: args.owner_user_in_event_id },
                select: { id: true, event_edition_id: true, user_permission: true, user_email: true, user_name: true },
            }),
        ]);
        if (!award) throw new Error("Award not found.");
        if (!owner) throw new Error("Owner (user_in_event) not found.");
        if (owner.event_edition_id !== award.event_edition_id) throw new Error("Owner is not part of this event edition.");
        const perm = String(owner.user_permission || "").toLowerCase().trim();
        if (perm !== "submit") throw new Error("User does not have permission to submit (requires 'submit').");

        const created = await submissionsRepo.create({
            award_id: args.award_id,
            user_in_event_id: args.owner_user_in_event_id,
            is_group_submission: !!args.is_group_submission,
            contact_name: args.contact_name,
            contact_email: args.contact_email,
            project_title: args.project_title,
            project_description: args.project_description,
            project_cover_image: null,
            project_url: args.project_url ?? null,
            status: "pending",
        });

        if (args.cover_image_file) {
            const saved = await saveUploadedFileLocal(created.id, args.cover_image_file);
            await prisma.submission.update({ where: { id: created.id }, data: { project_cover_image: saved.storageKey } });
        }

        const members = (args.members_user_in_event_ids ?? [])
            .map((n) => Number(n))
            .filter((n) => Number.isFinite(n) && n !== args.owner_user_in_event_id);
        if (members.length) await submissionsRepo.addMembers(created.id, members);

        const fileRows: AttachFileRow[] = [];
        for (const f of args.files ?? []) {
            const saved = await saveUploadedFileLocal(created.id, f);
            fileRows.push({
                submission_id: created.id,
                storage_key: saved.storageKey,
                original_name: f.originalname ?? "file",
                mime_type: f.mimetype ?? "application/octet-stream",
                size_bytes: saved.bytes,
                uploaded_by_user_in_event_id: args.owner_user_in_event_id,
            });
        }
        if (fileRows.length) await submissionsRepo.attachFiles(fileRows);

        const row = await submissionsRepo.getByIdForAdmin(created.id);
        if (!row) {
            const membersInfo: MemberBrief[] = [
                { id: args.owner_user_in_event_id, user_name: "", user_email: "" },
                ...members.map((id) => ({ id, user_name: "", user_email: "" }))
            ];
            return {
                id: created.id,
                status: "pending",
                award: {
                    id: award.id,
                    event_edition_id: award.event_edition_id,
                    category_name: award.category_name,
                    award_name: award.award_name,
                },
                owner: { id: args.owner_user_in_event_id, name: "", email: "" } as any,
                project: {
                    title: args.project_title,
                    description: args.project_description,
                    url: args.project_url ?? null,
                    cover_image: null,
                },
                files: [],
                counts: { members: 1 + members.length, members_info: membersInfo, files: fileRows.length },
                created_at: created.submission_date,
                message: "Submission created successfully",
            };
        }

        const membersInfo: MemberBrief[] = [
            { id: row.owner.id, user_name: row.owner.user_name, user_email: row.owner.user_email },
            ...(row.members ?? []).map((m) => ({
                id: m.user_in_event.id,
                user_name: m.user_in_event.user_name,
                user_email: m.user_in_event.user_email,
            }))
        ];

        return {
            id: row.id,
            status: row.status as "pending" | "approved" | "rejected",
            award: {
                id: row.award.id,
                event_edition_id: row.award.event_edition_id,
                category_name: row.award.category_name,
                award_name: row.award.award_name,
            },
            owner: { id: row.owner.id, name: row.owner.user_name, email: row.owner.user_email },
            project: {
                title: row.project_title,
                description: row.project_description,
                url: row.project_url,
                cover_image: row.project_cover_image ? fileUrl(row.project_cover_image) : null,
            },
            files: (row.files ?? []).map((f) => ({
                id: f.id,
                original_name: f.original_name,
                mime_type: f.mime_type,
                size_bytes: f.size_bytes,
                url: fileUrl(f.storage_key),
            })),
            counts: { members: 1 + row.members.length, members_info: membersInfo, files: row.files.length },
            created_at: row.submission_date,
            message: "Submission created successfully",
        };
    },

    async getOne(id: number): Promise<AdminSubmissionDetail | null> {
        const row = await submissionsRepo.getByIdForAdmin(id);
        if (!row) return null;
        return {
            id: row.id,
            award_id: row.award_id,
            user_in_event_id: row.user_in_event_id,
            is_group_submission: row.is_group_submission,
            contact_name: row.contact_name,
            contact_email: row.contact_email,
            project_title: row.project_title,
            project_description: row.project_description,
            project_cover_image: row.project_cover_image ? fileUrl(row.project_cover_image) : null,
            project_url: row.project_url,
            status: row.status as "pending" | "approved" | "rejected",
            reviewed_by_user_id: row.reviewed_by_user_id,
            reviewed_at: row.reviewed_at,
            review_note: row.review_note,
            winner: row.winner,
            submission_date: row.submission_date,
            award: {
                id: row.award.id,
                event_edition_id: row.award.event_edition_id,
                category_name: row.award.category_name,
                award_name: row.award.award_name,
            },
            owner: row.owner!,
            members: row.members ?? [],
            files: (row.files ?? []).map((f) => ({
                id: f.id,
                submission_id: f.submission_id,
                storage_key: f.storage_key,
                original_name: f.original_name,
                mime_type: f.mime_type,
                size_bytes: f.size_bytes,
                uploaded_by_user_in_event_id: f.uploaded_by_user_in_event_id,
                url: fileUrl(f.storage_key),
            })),
        };
    },

    async listByApprovalStatus(opts: {
        event_edition_id?: number;
        award_id?: number;
        status?: "pending" | "approved" | "rejected";
        take?: number;
        skip?: number;
    }): Promise<AdminSubmissionListItem[]> {
        const rows = await submissionsRepo.listByApprovalStatus(opts);
        return rows.map((r) => {
            const membersInfo: MemberBrief[] = [
                { id: r.owner.id, user_name: r.owner.user_name, user_email: r.owner.user_email },
                ...(r.members ?? []).map((m: any) => ({
                    id: m.user_in_event.id,
                    user_name: m.user_in_event.user_name,
                    user_email: m.user_in_event.user_email,
                }))
            ];
            return {
                id: r.id,
                project_title: r.project_title,
                project_description: r.project_description ?? null,
                project_url: r.project_url ?? null,
                cover_image: r.project_cover_image ? fileUrl(r.project_cover_image) : null,
                status: r.status as "pending" | "approved" | "rejected",
                submission_date: r.submission_date,
                award: {
                    id: r.award.id,
                    event_edition_id: r.award.event_edition_id,
                    category_name: r.award.category_name,
                    award_name: r.award.award_name,
                },
                owner: r.owner,
                counts: {
                    members: 1 + r._count.members,
                    members_info: membersInfo,
                    files: r._count.files,
                    votes: r._count.votes
                },
                files: (r as any).files
                    ? (r as any).files.map((f: any) => ({
                        id: f.id,
                        original_name: f.original_name,
                        mime_type: f.mime_type,
                        size_bytes: f.size_bytes,
                        url: fileUrl(f.storage_key),
                    }))
                    : [],
            };
        });
    },

    async review(
        id: number,
        reviewed_by_user_in_event_id: number | null,
        status: "approved" | "rejected" | "pending",
        review_note?: string | null
    ) {
        const before = await submissionsRepo.getByIdForAdmin(id);
        if (!before) throw new Error("Submission not found.");
        const prevStatus = (before.status as "pending" | "approved" | "rejected") || "pending";
        const ownerEmail = before.contact_email || before.owner?.user_email || null;
        const ownerName = before.owner?.user_name || before.contact_name || "Participant";
        const updated = await submissionsRepo.setStatus({
            id,
            status,
            reviewed_by_user_id: reviewed_by_user_in_event_id ?? null,
            review_note: review_note ?? null,
        });
        if (status === "rejected" && prevStatus !== "rejected" && ownerEmail) {
            const subject = "Your submission has been rejected";
            const reason = (review_note ?? "").trim() || "Your submission was reviewed and unfortunately it has been rejected.";
            const html = `
                <p>Hi ${escapeHtml(ownerName)},</p>
                <p>Your submission <strong>#${id}</strong> has been <strong>rejected</strong>.</p>
                <p><strong>Reason:</strong></p>
                <blockquote>${escapeHtml(reason)}</blockquote>
                <p>If applicable, please review the feedback, adjust your submission, and try again.</p>
                <p>— Jury Team</p>
            `.trim();
            const text = stripHtml(html);
            try {
                await emailService.send({ to: ownerEmail, subject, html, text });
            } catch {}
        }
        return updated;
    },
};

export default submissionsService;

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function escapeHtml(s: string) {
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}