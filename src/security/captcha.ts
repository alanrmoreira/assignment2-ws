import type { Request, Response, NextFunction } from "express";
import fetch from "node-fetch";
import { ENV } from "../config/env";

async function verifyRecaptcha(token: string, ip?: string) {
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            secret: ENV.CAPTCHA.RECAPTCHA_SECRET,
            response: token,
            remoteip: ip || ""
        })
    }).then(r => r.json() as Promise<{ success: boolean }>);
    return resp.success === true;
}

export async function requireCaptcha(req: Request, res: Response, next: NextFunction) {
    if (ENV.NODE_ENV !== "production") return next();

    if (!ENV.CAPTCHA.RECAPTCHA_SECRET && !ENV.CAPTCHA.TURNSTILE_SECRET) {
        return res.status(503).send("Captcha not configured");
    }

    const token =
        (req.body?.["g-recaptcha-response"] as string) ||
        (req.body?.captchaToken as string) ||
        (req.get("X-Captcha-Token") as string);

    if (!token) return res.status(400).send("Captcha required");

    const ip = (req.headers["cf-connecting-ip"] as string) || req.ip;

    const ok = ENV.CAPTCHA.RECAPTCHA_SECRET
        ? await verifyRecaptcha(token, ip)
        : true;

    if (!ok) return res.status(403).send("Captcha failed");
    next();
}