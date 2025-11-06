import type { Request, Response, NextFunction } from "express";
import { requireSessionAndCsrf } from "../security/csrf";

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
    const m = req.method.toUpperCase();
    if (m === "GET" || m === "HEAD" || m === "OPTIONS") {
        return next();
    }
    return requireSessionAndCsrf(req, res, next);
}