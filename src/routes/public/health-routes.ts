import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { ENV } from "../../config/env";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Health
 *     description: Public health endpoint
 */

/**
 * @openapi
 * /public/health:
 *   get:
 *     summary: Public health probe
 *     tags: [Public/Health]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "ok" }
 *                 env: { type: string, example: "development" }
 *                 uptime: { type: string, example: "12s" }
 *                 timestamp: { type: string, format: date-time }
 */
router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const uptime = process.uptime();
        res.status(200).json({
            status: "ok",
            env: ENV.NODE_ENV,
            uptime: `${Math.round(uptime)}s`,
            timestamp: new Date().toISOString(),
        });
    })
);

export default router;