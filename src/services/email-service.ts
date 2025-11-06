import nodemailer, { Transporter } from "nodemailer";
import { ENV } from "../config/env";

type SendArgs = {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
};

class EmailService {
    private transporterPromise: Promise<Transporter> | null = null;

    private async buildTransporter(): Promise<Transporter> {
        return nodemailer.createTransport({
            host: ENV.EMAIL.SMTP_HOST,
            port: ENV.EMAIL.SMTP_PORT,
            secure: ENV.EMAIL.SMTP_SECURE,
            auth: {
                user: ENV.EMAIL.SMTP_USER,
                pass: ENV.EMAIL.SMTP_PASS,
            },
            logger: true,
            debug: true,
        });
    }

    private getTransporter() {
        if (!this.transporterPromise) {
            this.transporterPromise = this.buildTransporter();
        }
        return this.transporterPromise;
    }

    async send({ to, subject, html, text }: SendArgs) {
        const transporter = await this.getTransporter();

        const info = await transporter.sendMail({
            from: ENV.EMAIL.FROM,
            to,
            subject,
            text,
            html,
            envelope: {
                from: ENV.EMAIL.FROM,
                to: Array.isArray(to) ? to : [to],
            },
            headers: {
                "X-Entity-Ref-ID": Date.now().toString(),
            },
        });

        return info;
    }
}

export const emailService = new EmailService();