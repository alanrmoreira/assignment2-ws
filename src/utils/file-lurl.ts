import { ENV } from "../config/env";

const trim = (s: string) => s.replace(/^\/+|\/+$/g, "");

function baseUrl() {
    return ENV.PUBLIC_URL ? trim(ENV.PUBLIC_URL) : `http://localhost:${ENV.PORT}`;
}

export function fileUrl(storageKey: string) {
    // Avoid /uploads/uploads/... if a stored key already includes "uploads/"
    const cleaned = trim(storageKey).replace(/^uploads\//i, "");
    return `${baseUrl()}/uploads/${cleaned}`;
}