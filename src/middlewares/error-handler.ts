import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { logger } from "../logger";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        logger.warn({ err, code: err.code, details: err.details }, "AppError");
        return res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
    }
    logger.error({ err }, "UnhandledError");
    return res.status(500).json({ error: "Internal Server Error" });
}