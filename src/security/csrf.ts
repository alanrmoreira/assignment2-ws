import type { Request, Response, NextFunction } from "express";

export function requireSessionAndCsrf(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session) {
            return res.status(401).json({ error: "Session missing" });
        }

        const headerToken = (req.get("X-CSRF-Token") || "").trim();
        const bodyToken = (req.body?._csrf || "").toString().trim();
        const queryToken = (req.query?._csrf as string | undefined)?.toString().trim() || "";
        const sent = headerToken || bodyToken || queryToken;

        const saved = (req.session.csrf || "").toString();

        if (!saved) {
            return res.status(401).json({ error: "Session missing" });
        }
        if (!sent || sent !== saved) {
            return res.status(403).json({ error: "Invalid CSRF" });
        }

        return next();
    } catch {
        return res.status(403).json({ error: "Invalid CSRF" });
    }
}