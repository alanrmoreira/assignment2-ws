import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { ENV } from "../../config/env";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Health
 *     description: Health endpoints
 */

/**
 * @openapi
 * /healthz:
 *   get:
 *     summary: Liveness probe
 *     tags: [Public/Health]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        res.json({
            status: "ok",
            env: ENV.NODE_ENV,
            uptime: `${Math.round(uptime)}s`,
            memory: {
                rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            },
            timestamp: new Date().toISOString(),
        });
    })
);

export default router;