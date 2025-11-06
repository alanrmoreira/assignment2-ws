import fs from "node:fs";
import path from "node:path";
import swaggerJsdoc, { SwaggerDefinition } from "swagger-jsdoc";
import { ENV } from "../config/env";

export const swaggerEnabled = String(process.env.ENABLE_SWAGGER).toLowerCase() === "true";

const SERVER_URL =
    process.env.SWAGGER_SERVER_URL?.trim() ||
    ENV.PUBLIC_URL?.trim() ||
    `http://localhost:${ENV.PORT}`;

const definition: SwaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: process.env.SWAGGER_TITLE?.trim() || "ignite-backend API",
        version: process.env.SWAGGER_VERSION?.trim() || "1.0.0",
        description:
            process.env.SWAGGER_DESCRIPTION?.trim() ||
            "Public submissions + backoffice API (session + CSRF).",
    },
    servers: [{ url: SERVER_URL, description: process.env.SWAGGER_SERVER_DESCRIPTION || "Server" }],
    components: {
        securitySchemes: {
            cookieAuth: { type: "apiKey", in: "cookie", name: ENV.SESSION.NAME || "sid" },
            csrfToken: { type: "apiKey", in: "header", name: "X-CSRF-Token" },
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
    },
};

function apisGlobs(): string[] {
    const cwd = process.cwd();
    const exists = (p: string) => fs.existsSync(p);
    const globs: string[] = [];

    if (exists(path.join(cwd, "src", "routes"))) globs.push("src/routes/**/*.ts");
    if (exists(path.join(cwd, "src", "controllers"))) globs.push("src/controllers/**/*.ts");
    if (exists(path.join(cwd, "dist", "routes"))) globs.push("dist/routes/**/*.js");
    if (exists(path.join(cwd, "dist", "controllers"))) globs.push("dist/controllers/**/*.js");

    return globs.length ? globs : ["dist/**/*.js", "src/**/*.ts"];
}

export const openapiSpec = swaggerJsdoc({
    definition,
    apis: apisGlobs(),
});