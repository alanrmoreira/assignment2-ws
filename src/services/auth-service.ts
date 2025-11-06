import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

import { authRepo } from "../repositories/auth-repo";
import { AppError } from "../errors/app-error";
import { signAccessToken } from "../security/jwt";
import { ENV } from "../config/env";
import { emailService } from "./email-service";

type ResetTokenPayload = {
    sub: number;
    email: string;
    type: "pwd-reset";
};

function toExpiresIn(v: string): SignOptions["expiresIn"] {
    const n = Number(v);
    return Number.isFinite(n) ? n : (v as unknown as SignOptions["expiresIn"]);
}

const RESET_SUBJECT = "Reset your password";

export const authService = {
    async login(email: string, password: string, expiresInOverride?: SignOptions["expiresIn"]) {
        const user = await authRepo.getByEmailWithPassword(email);
        if (!user) throw new AppError(401, "Invalid credentials");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new AppError(401, "Invalid credentials");

        if (user.role?.role_name !== "admin") {
            throw new AppError(403, "Admin role required");
        }

        const token = signAccessToken(
            { sub: user.id, email: user.email, role: user.role.role_name },
            expiresInOverride
        );

        const exp = typeof expiresInOverride !== "undefined" ? expiresInOverride : ENV.JWT.EXPIRES_IN;
        return { access_token: token, token_type: "Bearer", expires_in: exp };
    },

    async requestPasswordReset(email: string) {
        const user = await authRepo.getByEmailWithPassword(email);
        if (!user) return { ok: true };

        const payload: ResetTokenPayload = { sub: user.id, email: user.email, type: "pwd-reset" };

        const token = jwt.sign(payload, ENV.JWT.SECRET, {
            issuer: "ignite-backend",
            expiresIn: toExpiresIn(ENV.JWT.RESET_EXPIRES_IN)
        });

        const resetLink = `http://localhost:${ENV.PORT}/auth/reset-password?token=${encodeURIComponent(token)}`;

        await emailService.send({
            to: user.email,
            subject: RESET_SUBJECT,
            html: `<p>Hi ${user.name},</p>
<p>Click the button below to reset your password:</p>
<p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#0e7afe;color:#fff;text-decoration:none">Reset password</a></p>
<p>If you didn’t request this, just ignore this email.</p>`,
            text: `Reset your password: ${resetLink}`
        });

        return { ok: true, token: ENV.EMAIL.SEND_IN_DEV ? token : undefined };
    },

    async resetPassword(token: string, newPassword: string) {
        let decoded: unknown;
        try {
            decoded = jwt.verify(token, ENV.JWT.SECRET, { issuer: "ignite-backend" });
        } catch {
            throw new AppError(400, "Invalid or expired token");
        }

        const p = decoded as Partial<ResetTokenPayload>;
        if (p.type !== "pwd-reset" || typeof p.sub !== "number" || typeof p.email !== "string") {
            throw new AppError(400, "Invalid token");
        }

        const user = await authRepo.getByEmailWithPassword(p.email);
        if (!user || user.id !== p.sub) throw new AppError(400, "Invalid token");

        const hash = await bcrypt.hash(newPassword, 10);
        const { prisma } = await import("../db/prisma");
        await prisma.user.update({ where: { id: user.id }, data: { password: hash } });

        return { ok: true };
    }
};