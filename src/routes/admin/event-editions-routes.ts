import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../middlewares/async-handler";
import * as Controller from "../../controllers/admin/event-editions-controller";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * @openapi
 * tags:
 *   - name: Admin/EventEditions
 *     description: Manage event editions
 */

/**
 * @openapi
 * /admin/event-editions:
 *   get:
 *     summary: List event editions
 *     tags: [Admin/EventEditions]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK }
 */
router.get("/", asyncHandler(Controller.list));

/**
 * @openapi
 * /admin/event-editions/{id}:
 *   get:
 *     summary: Get event edition by id
 *     tags: [Admin/EventEditions]
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
 * /admin/event-editions:
 *   post:
 *     summary: Create event edition
 *     tags: [Admin/EventEditions]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [year, submissions_start, submissions_end, votes_start, votes_end]
 *             properties:
 *               year: { type: integer }
 *               submissions_start: { type: string, format: date-time }
 *               submissions_end:   { type: string, format: date-time }
 *               votes_start:       { type: string, format: date-time }
 *               votes_end:         { type: string, format: date-time }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Year already exists }
 */
router.post("/", asyncHandler(Controller.create));

/**
 * @openapi
 * /admin/event-editions/{id}:
 *   put:
 *     summary: Update event edition (all fields)
 *     tags: [Admin/EventEditions]
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
 *             required: [year, submissions_start, submissions_end, votes_start, votes_end]
 *             properties:
 *               year: { type: integer }
 *               submissions_start: { type: string, format: date-time }
 *               submissions_end:   { type: string, format: date-time }
 *               votes_start:       { type: string, format: date-time }
 *               votes_end:         { type: string, format: date-time }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 *       409: { description: Year already exists }
 */
router.put("/:id", asyncHandler(Controller.update));

/**
 * @openapi
 * /admin/event-editions/{id}:
 *   patch:
 *     summary: Patch event edition (one or more fields)
 *     tags: [Admin/EventEditions]
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
 *               year: { type: integer }
 *               submissions_start: { type: string, format: date-time }
 *               submissions_end:   { type: string, format: date-time }
 *               votes_start:       { type: string, format: date-time }
 *               votes_end:         { type: string, format: date-time }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 *       409: { description: Year already exists }
 */
router.patch("/:id", asyncHandler(Controller.patch));

/**
 * @openapi
 * /admin/event-editions/{id}:
 *   delete:
 *     summary: Delete event edition
 *     tags: [Admin/EventEditions]
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

/**
 * @openapi
 * /admin/event-editions/{id}/users/upload-csv:
 *   post:
 *     summary: Upload CSV to populate users_in_event
 *     description: >
 *       CSV header must be: `user_name,user_email,user_sait_id,user_permission`
 *       Valid permissions: `participant`, `juror`, `both`.
 *       Returns list of created records and skipped rows with reasons.
 *     tags: [Admin/EventEditions]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Import result }
 *       400: { description: Invalid CSV }
 *       404: { description: Event edition not found }
 */
router.post(
    "/:id/users/upload-csv",
    upload.single("file"),
    asyncHandler(Controller.uploadCsv)
);

export default router;