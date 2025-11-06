import { Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import { LoginSchema } from "../../types/auth-dto";
import { authService } from "../../services/auth-service";
import { isSwaggerRequest } from "../../utils/swagger-detect";
import { ENV } from "../../config/env";

export const login = async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const override: SignOptions["expiresIn"] | undefined =
        isSwaggerRequest(req) && ENV.SWAGGER.LONG_TTL_JWT
            ? (ENV.SWAGGER.JWT_EXPIRES_IN as SignOptions["expiresIn"])
            : undefined;

    const result = await authService.login(parsed.data.email, parsed.data.password, override);
    res.json(result);
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    if (typeof email !== "string") return res.status(400).json({ error: "email is required" });
    const out = await authService.requestPasswordReset(email);
    res.json(out);
};

export const performResetPassword = async (req: Request, res: Response) => {
    const { token, new_password } = req.body ?? {};
    if (typeof token !== "string" || typeof new_password !== "string" || new_password.length < 8) {
        return res.status(400).json({ error: "token and new_password (min 8 chars) are required" });
    }
    const out = await authService.resetPassword(token, new_password);
    res.json(out);
};