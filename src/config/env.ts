import dotenv from "dotenv";
dotenv.config();

const env = (k: string, fallback?: string) => {
    const v = process.env[k];
    return v === undefined || v === "" ? fallback : v;
};

export const ENV = {
    NODE_ENV: env("NODE_ENV", "development")!,
    PORT: Number(env("PORT", "80")),
    PUBLIC_URL: env("PUBLIC_URL"),
    CORS_ORIGINS: env("CORS_ORIGINS", "http://localhost:80")
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) as string[],

    SWAGGER: {
        ENABLED: env("ENABLE_SWAGGER", "true") === "true",
        TITLE: env("SWAGGER_TITLE", "ignite-backend API")!,
        VERSION: env("SWAGGER_VERSION", "1.0.0")!,
        DESCRIPTION: env("SWAGGER_DESCRIPTION", "")!,
        SERVER_URL: env("SWAGGER_SERVER_URL", "")!,
        SERVER_DESCRIPTION: env("SWAGGER_SERVER_DESCRIPTION", "")!,
        DETECT_BY: env("SWAGGER_DETECT_BY", "referer")!,
        DETECT_HEADER_NAME: env("SWAGGER_DETECT_HEADER_NAME", "X-Swagger")!,
        LONG_TTL_JWT: env("SWAGGER_LONG_TTL_JWT", "true") === "true",
        JWT_EXPIRES_IN: env("SWAGGER_JWT_EXPIRES_IN", "24h")!,
        LONG_TTL_CSRF: env("SWAGGER_LONG_TTL_CSRF", "true") === "true",
        CSRF_MAX_AGE_MS: Number(env("SWAGGER_CSRF_MAX_AGE_MS", `${24 * 60 * 60 * 1000}`))
    },

    SESSION: {
        NAME: env("SESSION_NAME", "sid")!,
        SECRET: env("SESSION_SECRET", "please-change-me")!,
        SECURE: env("NODE_ENV") === "production",
        HTTP_ONLY: true,
        SAME_SITE: "lax" as const,
        MAX_AGE_MS: 1000 * 60 * 30
    },

    JWT: {
        SECRET: env("JWT_SECRET", "change-me-please")!,
        EXPIRES_IN: env("JWT_EXPIRES_IN", "1h")!,
        RESET_EXPIRES_IN: env("JWT_RESET_EXPIRES_IN", "15m")!
    },

    CAPTCHA: {
        TURNSTILE_SECRET: env("TURNSTILE_SECRET", "")!,
        RECAPTCHA_SECRET: env("RECAPTCHA_SECRET", "")!
    },

    RECAPTCHA_SITE_KEY: env("RECAPTCHA_SITE_KEY", "")!,

    DB: {
        HOST: env("DB_HOST", "localhost")!,
        PORT: Number(env("DB_PORT", "3306")),
        USER: env("DB_USER", "root")!,
        PASSWORD: env("DB_PASSWORD", "")!,
        NAME: env("DB_NAME", "ignite")!
    },

    DATABASE_URL: env("DATABASE_URL"),

    SESSION_DB: {
        HOST: env("SESSION_DB_HOST", "127.0.0.1")!,
        PORT: Number(env("SESSION_DB_PORT", "3306")),
        USER: env("SESSION_DB_USER", "root")!,
        PASSWORD: env("SESSION_DB_PASSWORD", "")!,
        NAME: env("SESSION_DB_NAME", "ignite_sessions")!
    },

    EMAIL: {
        DRIVER: env("EMAIL_DRIVER", "console") as "smtp" | "ethereal" | "console",
        FROM: env("EMAIL_FROM", "no-reply@ignite.sait.ca")!,
        SEND_IN_DEV: env("EMAIL_SEND_IN_DEV", "true") === "true",
        SMTP_HOST: env("SMTP_HOST", ""),
        SMTP_PORT: Number(env("SMTP_PORT", "587")),
        SMTP_SECURE: env("SMTP_SECURE", "false") === "true",
        SMTP_USER: env("SMTP_USER", ""),
        SMTP_PASS: env("SMTP_PASS", "")
    }
};

export const IS_PROD = ENV.NODE_ENV === "production";