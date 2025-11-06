import app from "./app";
import { ENV } from "./config/env";
import { logger } from "./logger";
import express from "express";
import path from "path";
import { UploadPaths } from "./config/upload";

app.use("/uploads", express.static(UploadPaths.ROOT));

app.use("/docs", (req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'"
    );
    next();
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "UnhandledRejection");
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    logger.error({ err }, "UncaughtException");
    process.exit(1);
});

const server = app.listen(ENV.PORT, () => {
    logger.info(`HTTP server on http://localhost:${ENV.PORT}`);
});

function shutdown(sig: string) {
    logger.info({ sig }, "Shutting down");
    server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
}

["SIGINT", "SIGTERM"].forEach((sig) =>
    process.on(sig as NodeJS.Signals, () => shutdown(sig))
);