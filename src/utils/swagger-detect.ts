import type { Request } from "express";
import { ENV } from "../config/env";

export function isSwaggerRequest(req: Request): boolean {
    if (!ENV.SWAGGER.ENABLED) return false;
    const mode = (ENV.SWAGGER.DETECT_BY || "referer").toLowerCase();
    if (mode === "header") {
        const name = ENV.SWAGGER.DETECT_HEADER_NAME || "x-swagger";
        const v = req.get(name);
        return !!v && v.toLowerCase() !== "false";
    }
    if (mode === "user-agent") {
        const ua = req.get("user-agent") || "";
        return ua.toLowerCase().includes("swagger");
    }
    const ref = req.get("referer") || req.get("origin") || "";
    const base = ENV.PUBLIC_URL?.replace(/\/+$/, "") || "";
    if (!base) return ref.includes("/docs");
    return ref.startsWith(`${base}/docs`);
}