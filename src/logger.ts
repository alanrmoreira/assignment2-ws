import pino, { LoggerOptions } from "pino";

function buildOptions(): LoggerOptions {
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
        return { level: process.env.LOG_LEVEL || "info" };
    }

    try {
        require("pino-pretty");
        return {
            level: process.env.LOG_LEVEL || "debug",
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "SYS:standard",
                    singleLine: false
                }
            }
        };
    } catch {
        return { level: process.env.LOG_LEVEL || "debug" };
    }
}

export const logger = pino(buildOptions());