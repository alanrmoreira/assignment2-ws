import rateLimit from "express-rate-limit";

export const anonLimiter = rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
});

export const formLimiter = rateLimit({
    windowMs: 60_000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false
});