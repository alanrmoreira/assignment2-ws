// src/routes/public/csrf-routes.ts
import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { csrfController } from "../../controllers/public/csrf-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/CSRF
 *     description: CSRF token utilities for public endpoints
 */

/**
 * @openapi
 * /public/csrf-token:
 *   get:
 *     summary: Issue a CSRF token tied to the current session
 *     description: Returns a JSON object with a hex token in the "csrf" field.
 *     tags: [Public/CSRF]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrf:
 *                   type: string
 *                   example: "1bff568d0d8ce011643e58baa8cbd4c118187022"
 */
router.get("/csrf-token", asyncHandler(csrfController.token));

/**
 * @openapi
 * /public/csrf/validate:
 *   post:
 *     summary: Validate a CSRF token
 *     description: If the token matches the one in the session, returns 200; otherwise 403.
 *     tags: [Public/CSRF]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _csrf:
 *                 type: string
 *     responses:
 *       200: { description: Valid }
 *       401: { description: Session missing }
 *       403: { description: Invalid CSRF }
 */
router.post("/csrf/validate", asyncHandler(csrfController.validate));

export default router;