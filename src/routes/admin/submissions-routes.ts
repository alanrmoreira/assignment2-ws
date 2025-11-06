import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as Controller from "../../controllers/admin/submissions-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin/Submissions
 *     description: Manage submissions
 */

/**
 * @openapi
 * /admin/submissions/{submission_id}:
 *   get:
 *     summary: Submission detail (includes files, owner, members)
 *     tags: [Admin/Submissions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: submission_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not Found
 */
router.get("/:id", asyncHandler(Controller.detail));

/**
 * @openapi
 * /admin/submissions/{submission_id}/review:
 *   post:
 *     summary: Approve/Reject a submission
 *     tags: [Admin/Submissions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: submission_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending]
 *               note:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not Found
 */
router.post("/:id/review", asyncHandler(Controller.review));

export default router;