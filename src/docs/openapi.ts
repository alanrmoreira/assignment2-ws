import swaggerJsdoc, { SwaggerDefinition } from "swagger-jsdoc";
import { ENV } from "../config/env";

const SWAGGER_ENABLED =
    (process.env.ENABLE_SWAGGER ?? (ENV.NODE_ENV !== "production" ? "true" : "true")) === "true";

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
            "Public submissions + backoffice API (session + CSRF)."
    },
    servers: [
        {
            url: SERVER_URL,
            description: process.env.SWAGGER_SERVER_DESCRIPTION?.trim() || "Default server"
        }
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: ENV.SESSION.NAME || "sid"
            },
            csrfToken: {
                type: "apiKey",
                in: "header",
                name: "X-CSRF-Token"
            },
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            HealthResponse: {
                type: "object",
                properties: {
                    ok: { type: "boolean" },
                    env: { type: "string" }
                },
                required: ["ok", "env"]
            },
            CsrfResponse: {
                type: "object",
                properties: { csrf: { type: "string" } },
                required: ["csrf"]
            },
            PublicSubmissionRequest: {
                type: "object",
                properties: {
                    title: { type: "string", maxLength: 200 },
                    description: { type: "string" },
                    url: { type: "string", nullable: true },
                    captchaToken: { type: "string" }
                },
                required: ["title", "captchaToken"]
            },
            PublicSubmissionResponse: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    status: { type: "string", enum: ["pending", "approved", "rejected"] }
                },
                required: ["id", "status"]
            },
            LoginRequest: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email", maxLength: 255 },
                    password: { type: "string", minLength: 8, maxLength: 255 }
                }
            },
            LoginResponse: {
                type: "object",
                properties: {
                    access_token: { type: "string" },
                    token_type: { type: "string", example: "Bearer" },
                    expires_in: { type: "string" }
                },
                required: ["access_token", "token_type", "expires_in"]
            },
            ForgotPasswordRequest: {
                type: "object",
                required: ["email"],
                properties: {
                    email: { type: "string", format: "email", maxLength: 255 }
                }
            },
            ResetPasswordRequest: {
                type: "object",
                required: ["token", "new_password"],
                properties: {
                    token: { type: "string" },
                    new_password: { type: "string", minLength: 8, maxLength: 255 }
                }
            },
            ResetPasswordResponse: {
                type: "object",
                properties: { ok: { type: "boolean" } },
                required: ["ok"]
            },
            ErrorResponse: {
                type: "object",
                properties: { error: { type: "string" } },
                required: ["error"]
            }
        }
    }
};

export const openapiSpec = swaggerJsdoc({
    definition,
    apis: ["src/routes/**/*.ts", "src/controllers/**/*.ts"]
});

export const swaggerEnabled = SWAGGER_ENABLED;
export const swaggerServerUrl = SERVER_URL;