import { Router, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import { openapiSpec, swaggerEnabled } from "../../swagger/swagger";

const router = Router();

router.get("/openapi.json", (req: Request, res: Response) => {
    if (!swaggerEnabled) return res.status(404).end();
    return res.json(openapiSpec);
});

router.use(
    "/docs",
    (req: Request, res: Response, next: NextFunction) => {
        if (!swaggerEnabled) return res.status(404).end();
        next();
    },
    helmet({
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                "style-src": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", "data:", "https:"],
                "font-src": ["'self'", "data:", "https:"],
                "connect-src": ["'self'"],
                "object-src": ["'none'"],
                "base-uri": ["'self'"],
                "frame-ancestors": ["'none'"]
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "same-origin" },
        referrerPolicy: { policy: "no-referrer" },
        hsts: { maxAge: 15552000, includeSubDomains: true }
    }),
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
        explorer: false,
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "none",
            tagsSorter: "alpha",
            operationsSorter: "alpha",
            requestInterceptor: (req: any) => {
                req.credentials = "include";
                return req;
            }
        }
    })
);

export default router;