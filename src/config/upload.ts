import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { ENV } from "./env";

export const UploadPaths = {
    ROOT: path.resolve(process.cwd(), "uploads"),
    submissionDir: (submissionId: number) =>
        path.resolve(UploadPaths.ROOT, "submissions", String(submissionId)),
};

export function ensureDirSync(dir: string) {
    fs.mkdirSync(dir, { recursive: true });
}

export function normalizeStorageKey(p: string) {
    const trimmed = p.replace(/\\/g, "/");
    return trimmed.startsWith("uploads/") ? trimmed.slice("uploads/".length) : trimmed;
}

export function urlForStorageKey(storageKey: string): string {
    const base = ENV.PUBLIC_URL || `http://localhost:${ENV.PORT}`;
    const key = normalizeStorageKey(storageKey);
    return `${base}/uploads/${key}`;
}

const storage = multer.memoryStorage();

export const incomingUpload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file
        files: 30,
    },
}).fields([
    { name: "cover_image", maxCount: 1 },
    { name: "files", maxCount: 30 },
]);