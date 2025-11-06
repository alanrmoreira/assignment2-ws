import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as Controller from "../../controllers/admin/roles-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin/Roles
 *     description: Roles management
 */

/**
 * @openapi
 * /admin/roles:
 *   get:
 *     summary: List roles
 *     tags: [Admin/Roles]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
router.get("/", asyncHandler(Controller.list));

/**
 * @openapi
 * /admin/roles/{id}:
 *   get:
 *     summary: Get role by id
 *     tags: [Admin/Roles]
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
 * /admin/roles:
 *   post:
 *     summary: Create role
 *     tags: [Admin/Roles]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role_name]
 *             properties:
 *               role_name: { type: string, maxLength: 50 }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Role already exists }
 */
router.post("/", asyncHandler(Controller.create));

/**
 * @openapi
 * /admin/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Admin/Roles]
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
 *             required: [role_name]
 *             properties:
 *               role_name: { type: string, maxLength: 50 }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 *       409: { description: Role already exists }
 */
router.put("/:id", asyncHandler(Controller.update));

/**
 * @openapi
 * /admin/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Admin/Roles]
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