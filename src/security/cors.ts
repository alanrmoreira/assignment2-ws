import cors, { CorsOptions } from "cors";
import { ENV } from "../config/env";

const envOrigins = ENV.CORS_ORIGINS as string | string[] | undefined;

const originsList: string[] = Array.isArray(envOrigins)
    ? envOrigins
    : ((envOrigins || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean));

const originsSet = new Set(originsList);

const options: CorsOptions = {
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (originsSet.has(origin)) return cb(null, true);
        return cb(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
        "Content-Type",
        "Accept",
        "Authorization",
        "X-CSRF-Token",
        "X-Captcha-Token"
    ],
    maxAge: 86400,
    optionsSuccessStatus: 204
};

export const corsMiddleware = cors(options);