import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../security/jwt";
import { AppError } from "../errors/app-error";

export type AuthUser = {
    userId: number;
    email: string;
    role: string;
};

declare global {
    namespace Express {
        interface Request {
            auth?: AuthUser;
        }
    }
}

function extractBearer(req: Request): string | null {
    const h = req.header("Authorization");
    if (!h) return null;
    const [scheme, token] = h.split(" ");
    if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
    return token.trim();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const token = extractBearer(req);
    if (!token) throw new AppError(401, "Missing or invalid Authorization header");

    try {
        const payload = verifyAccessToken(token);
        req.auth = { userId: payload.sub, email: payload.email, role: payload.role };
        next();
    } catch {
        throw new AppError(401, "Invalid or expired token");
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    requireAuth(req, res, () => {
        if (req.auth?.role !== "admin") {
            throw new AppError(403, "Admin role required");
        }
        next();
    });
}