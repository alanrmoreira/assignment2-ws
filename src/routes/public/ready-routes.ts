import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { pingDB } from "../../config/db";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Ready
 *     description: Readiness probe
 */

/**
 * @openapi
 * /readyz:
 *   get:
 *     summary: Readiness probe
 *     tags: [Public/Ready]
 *     responses:
 *       200: { description: Ready }
 *       503: { description: Not ready }
 */
router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const dbOk = await pingDB();
        if (!dbOk) {
            return res.status(503).json({ ready: false, checks: { mysql: false } });
        }
        return res.json({ ready: true, checks: { mysql: true } });
    })
);

export default router;