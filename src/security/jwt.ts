import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env";

export interface AppJwtPayload {
    sub: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
    iss?: string;
}

type ResetPayload = {
    sub: number;
    email: string;
    typ: "pwd_reset";
    iat?: number;
    exp?: number;
    iss?: string;
};

function parseExpiresIn(input: string): SignOptions["expiresIn"] {
    const asNumber = Number(input);
    return Number.isFinite(asNumber) ? asNumber : (input as unknown as SignOptions["expiresIn"]);
}

export function signAccessToken(payload: AppJwtPayload, expiresInOverride?: SignOptions["expiresIn"]): string {
    const options: SignOptions = {
        expiresIn: expiresInOverride ?? parseExpiresIn(ENV.JWT.EXPIRES_IN),
        issuer: "ignite-backend"
    };
    return jwt.sign(payload as object, ENV.JWT.SECRET as jwt.Secret, options);
}

export function verifyAccessToken(token: string): AppJwtPayload {
    const decoded = jwt.verify(token, ENV.JWT.SECRET as jwt.Secret, { issuer: "ignite-backend" });
    if (typeof decoded !== "object" || decoded === null) {
        throw new Error("Invalid token payload");
    }
    const d = decoded as Record<string, unknown>;
    const rawSub = d.sub;
    let sub: number;
    if (typeof rawSub === "number") sub = rawSub;
    else if (typeof rawSub === "string" && /^\d+$/.test(rawSub)) sub = Number(rawSub);
    else throw new Error("Invalid subject claim");
    const email = d.email;
    const role = d.role;
    if (typeof email !== "string" || typeof role !== "string") {
        throw new Error("Invalid payload claims");
    }
    return {
        sub,
        email,
        role,
        iat: typeof d.iat === "number" ? d.iat : undefined,
        exp: typeof d.exp === "number" ? d.exp : undefined,
        iss: typeof d.iss === "string" ? d.iss : undefined
    };
}

export function signPasswordResetToken(payload: { sub: number; email: string }) {
    const options: SignOptions = {
        expiresIn: parseExpiresIn(ENV.JWT.RESET_EXPIRES_IN),
        issuer: "ignite-backend"
    };
    return jwt.sign({ ...payload, typ: "pwd_reset" }, ENV.JWT.SECRET as jwt.Secret, options);
}

export function verifyPasswordResetToken(token: string): ResetPayload {
    const decoded = jwt.verify(token, ENV.JWT.SECRET as jwt.Secret, { issuer: "ignite-backend" });
    if (typeof decoded !== "object" || decoded === null) throw new Error("Invalid token");
    const d = decoded as Record<string, unknown>;
    if (d.typ !== "pwd_reset") throw new Error("Invalid token type");
    const rawSub = d.sub;
    let sub: number;
    if (typeof rawSub === "number") sub = rawSub;
    else if (typeof rawSub === "string" && /^\d+$/.test(rawSub)) sub = Number(rawSub);
    else throw new Error("Invalid subject claim");
    const email = d.email;
    if (typeof email !== "string") throw new Error("Invalid token payload");
    return {
        sub,
        email,
        typ: "pwd_reset",
        iat: typeof d.iat === "number" ? d.iat : undefined,
        exp: typeof d.exp === "number" ? d.exp : undefined,
        iss: typeof d.iss === "string" ? d.iss : undefined
    };
}