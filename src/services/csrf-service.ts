import { randomBytes } from "crypto";
import type { Request } from "express";
import { AppError } from "../errors/app-error";
import { isSwaggerRequest } from "../utils/swagger-detect";
import { ENV } from "../config/env";

export const csrfService = {
    issue(req: Request) {
        if (!req.session) throw new AppError(401, "Session missing");
        if (!req.session.csrf) req.session.csrf = randomBytes(24).toString("hex");
        if (isSwaggerRequest(req) && ENV.SWAGGER.LONG_TTL_CSRF) {
            req.session.csrf_issued_at = Date.now();
        }
        return req.session.csrf as string;
    },

    validate(req: Request) {
        if (!req.session) throw new AppError(401, "Session missing");

        const headerToken = (req.get("X-CSRF-Token") || "").trim();
        const bodyToken = (req.body?._csrf || "").toString().trim();
        const queryToken = (req.query?._csrf as string | undefined)?.toString().trim() || "";
        const sent = headerToken || bodyToken || queryToken;
        const saved = (req.session.csrf || "").toString();

        if (!saved) throw new AppError(401, "Session missing");
        if (!sent || sent !== saved) throw new AppError(403, "Invalid CSRF");

        if (isSwaggerRequest(req) && ENV.SWAGGER.LONG_TTL_CSRF) {
            const issued = Number(req.session.csrf_issued_at || 0);
            const maxAge = Number(ENV.SWAGGER.CSRF_MAX_AGE_MS || 0);
            if (issued > 0 && maxAge > 0) {
                if (Date.now() - issued > maxAge) throw new AppError(403, "Invalid CSRF");
            }
        }

        return true;
    }
};