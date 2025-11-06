import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as Controller from "../../controllers/public/auth-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Auth
 *     description: Public authentication endpoints
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Admin login (JWT)
 *     description: Returns a Bearer token if the credentials are valid and the user has admin role.
 *     tags: [Public/Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, maxLength: 255 }
 *               password: { type: string, minLength: 8, maxLength: 255 }
 *     responses:
 *       200: { description: JWT issued successfully }
 *       400: { description: Validation error }
 *       401: { description: Invalid credentials }
 *       403: { description: Admin role required }
 */
router.post("/login", asyncHandler(Controller.login));

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Public/Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Email sent (or no-op) }
 */
router.post("/forgot-password", asyncHandler(Controller.forgotPassword));

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Perform password reset with token
 *     tags: [Public/Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, new_password]
 *             properties:
 *               token: { type: string }
 *               new_password: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password updated }
 *       400: { description: Invalid token / validation error }
 */
router.post("/reset-password", asyncHandler(Controller.performResetPassword));

export default router;