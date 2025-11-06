export type SubmissionDTO = {
    awardId: number;
    ownerUserInEventId: number;
    isGroup: boolean;
    contactName: string;
    contactEmail: string;
    title: string;
    description: string;
    coverImage?: string | null;
    url?: string | null;
    file?: string | null;
    status: "pending" | "approved" | "rejected";
    memberIds?: number[];
};