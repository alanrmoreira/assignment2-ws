import { prisma } from "../db/prisma";

export type CreateSubmissionInput = {
    award_id: number;
    user_in_event_id: number;
    is_group_submission: boolean;
    contact_name: string;
    contact_email: string;
    project_title: string;
    project_description: string;
    project_cover_image?: string | null;
    project_url?: string | null;
    status?: "pending" | "approved" | "rejected";
};

export type AttachFileRow = {
    submission_id: number;
    storage_key: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    uploaded_by_user_in_event_id: number;
};

export const submissionsRepo = {
    create: (data: CreateSubmissionInput) =>
        prisma.submission.create({
            data: {
                award_id: data.award_id,
                user_in_event_id: data.user_in_event_id,
                is_group_submission: data.is_group_submission,
                contact_name: data.contact_name,
                contact_email: data.contact_email,
                project_title: data.project_title,
                project_description: data.project_description,
                project_cover_image: data.project_cover_image ?? null,
                project_url: data.project_url ?? null,
                status: (data.status as any) ?? "pending",
            },
        }),

    addMembers: (submissionId: number, memberUserInEventIds: number[]) =>
        memberUserInEventIds.length
            ? prisma.submissionMember.createMany({
                data: memberUserInEventIds.map((uid) => ({
                    submission_id: submissionId,
                    user_in_event_id: uid,
                })),
                skipDuplicates: true,
            })
            : { count: 0 },

    attachFiles: (files: AttachFileRow[]) =>
        files.length
            ? prisma.submissionFile.createMany({
                data: files.map((f) => ({
                    submission_id: f.submission_id,
                    storage_key: f.storage_key,
                    original_name: f.original_name,
                    mime_type: f.mime_type,
                    size_bytes: f.size_bytes,
                    uploaded_by_user_in_event_id: f.uploaded_by_user_in_event_id,
                })),
            })
            : { count: 0 },

    getByIdForAdmin: (id: number) =>
        prisma.submission.findUnique({
            where: { id },
            include: {
                award: { select: { id: true, category_name: true, event_edition_id: true, award_name: true } },
                owner: {
                    select: {
                        id: true,
                        user_name: true,
                        user_email: true,
                        user_sait_id: true,
                        event_edition_id: true,
                    },
                },
                members: {
                    include: {
                        user_in_event: {
                            select: {
                                id: true,
                                user_name: true,
                                user_email: true,
                                user_sait_id: true,
                            },
                        },
                    },
                },
                files: {
                    select: {
                        id: true,
                        submission_id: true,
                        storage_key: true,
                        original_name: true,
                        mime_type: true,
                        size_bytes: true,
                        uploaded_by_user_in_event_id: true,
                    },
                    orderBy: { id: "asc" },
                },
            },
        }),

    listByApprovalStatus: (opts: {
        event_edition_id?: number;
        award_id?: number;
        status?: "pending" | "approved" | "rejected";
        take?: number;
        skip?: number;
    }) =>
        prisma.submission.findMany({
            where: {
                award_id: opts.award_id ?? undefined,
                status: (opts.status as any) ?? undefined,
                award: opts.event_edition_id ? { event_edition_id: opts.event_edition_id } : undefined,
            },
            orderBy: { submission_date: "desc" },
            take: opts.take ?? 50,
            skip: opts.skip ?? 0,
            include: {
                award: { select: { id: true, event_edition_id: true, category_name: true, award_name: true } },
                owner: { select: { id: true, user_name: true, user_email: true } },
                _count: { select: { members: true, files: true, votes: true } },
                files: {
                    select: {
                        id: true,
                        storage_key: true,
                        original_name: true,
                        mime_type: true,
                        size_bytes: true,
                    },
                    orderBy: { id: "asc" },
                },
                members: {
                    include: {
                        user_in_event: {
                            select: {
                                id: true,
                                user_name: true,
                                user_email: true,
                            },
                        },
                    },
                },
            },
        }),

    setStatus: (args: {
        id: number;
        status: "pending" | "approved" | "rejected";
        reviewed_by_user_id?: number | null;
        review_note?: string | null;
    }) =>
        prisma.submission.update({
            where: { id: args.id },
            data: {
                status: args.status,
                reviewed_by_user_id: args.reviewed_by_user_id ?? null,
                reviewed_at: args.reviewed_by_user_id ? new Date() : null,
                review_note: args.review_note ?? null,
            },
        }),
};