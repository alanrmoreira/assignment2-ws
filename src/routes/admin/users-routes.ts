import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as Controller from "../../controllers/admin/users-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin/Users
 *     description: Users management
 */

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List users
 *     tags: [Admin/Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
router.get("/", asyncHandler(Controller.list));

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Admin/Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get("/:id", asyncHandler(Controller.get));

/**
 * @openapi
 * /admin/users:
 *   post:
 *     summary: Create user
 *     tags: [Admin/Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role_id]
 *             properties:
 *               name:     { type: string, maxLength: 120 }
 *               email:    { type: string, format: email, maxLength: 255 }
 *               password: { type: string, minLength: 8, maxLength: 255 }
 *               role_id:  { type: integer }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Role not found }
 *       409: { description: Email already in use }
 */
router.post("/", asyncHandler(Controller.create));

/**
 * @openapi
 * /admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin/Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string, maxLength: 120 }
 *               email:    { type: string, format: email, maxLength: 255 }
 *               password: { type: string, minLength: 8, maxLength: 255 }
 *               role_id:  { type: integer }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Role not found }
 *       404: { description: Not found }
 *       409: { description: Email already in use }
 */
router.put("/:id", asyncHandler(Controller.update));

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin/Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete("/:id", asyncHandler(Controller.remove));

export default router;