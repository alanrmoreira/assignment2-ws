import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session, * as expressSessionNS from "express-session";
import pinoHttp from "pino-http";
import MySQLStoreFactory from "express-mysql-session";

import { ENV, IS_PROD } from "./config/env";
import { corsMiddleware } from "./security/cors";
import { anonLimiter } from "./security/rate-llimit";
import routes from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { logger } from "./logger";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'"],
                "style-src": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", "data:"],
                "connect-src": ["'self'"],
                "form-action": ["'self'"],
                "frame-ancestors": ["'none'"],
            },
        },
        referrerPolicy: { policy: "no-referrer" },
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "same-origin" },
        hsts: IS_PROD ? { maxAge: 15552000, includeSubDomains: true } : false,
    })
);

app.use(
    pinoHttp({
        logger,
        autoLogging: true,
        transport: !IS_PROD ? { target: "pino-pretty" } : undefined,
    })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(corsMiddleware);
app.use(anonLimiter);

const MySQLStore = MySQLStoreFactory(expressSessionNS);
const sessionStore = new MySQLStore({
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    user: ENV.DB.USER,
    password: ENV.DB.PASSWORD,
    database: ENV.DB.NAME,

    createDatabaseTable: false,
    schema: {
        tableName: "sessions",
        columnNames: {
            session_id: "session_id",
            expires: "expires",
            data: "data",
        },
    },
});

app.use(
    session({
        name: ENV.SESSION.NAME,
        secret: ENV.SESSION.SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            secure: 'auto',
            httpOnly: ENV.SESSION.HTTP_ONLY,
            sameSite: ENV.SESSION.SAME_SITE,
            maxAge: ENV.SESSION.MAX_AGE_MS,
        },
    })
);

app.use(routes);

app.use(errorHandler);

export default app;