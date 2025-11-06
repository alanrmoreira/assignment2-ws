import "express-session";

declare module "express-session" {
    interface SessionData {
        csrf?: string;
        csrf_issued_at?: number;
    }
}