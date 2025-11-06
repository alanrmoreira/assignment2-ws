import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { incomingUpload } from "../../config/upload";
import * as Controller from "../../controllers/public/submissions-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Submissions
 *     description: Public submission
 */

/**
 * @openapi
 * /public:
 *   get:
 *     summary: List submissions
 *     tags: [Public/Submissions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: event_edition_id
 *         schema: { type: integer }
 *       - in: query
 *         name: award_id
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: take
 *         schema: { type: integer, minimum: 1, maximum: 200 }
 *       - in: query
 *         name: skip
 *         schema: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - id
 *                   - project_title
 *                   - status
 *                   - submission_date
 *                   - award
 *                   - owner
 *                   - counts
 *                 properties:
 *                   id: { type: integer, example: 10 }
 *                   project_title: { type: string, example: "string title" }
 *                   project_description: { type: string, nullable: true, example: "Detailed description" }
 *                   project_url: { type: string, nullable: true, example: "https://example.com" }
 *                   cover_image: { type: string, nullable: true, example: "http://localhost:80/uploads/submissions/10/cover.jpg" }
 *                   status: { type: string, enum: [pending, approved, rejected] }
 *                   submission_date: { type: string, format: date-time }
 *                   award:
 *                     type: object
 *                     required: [id, event_edition_id, category_name, award_name]
 *                     properties:
 *                       id: { type: integer, example: 2 }
 *                       event_edition_id: { type: integer, example: 1 }
 *                       category_name: { type: string, example: "graphic" }
 *                       award_name: { type: string, example: "Best branding" }
 *                   owner:
 *                     type: object
 *                     required: [id, user_name, user_email]
 *                     properties:
 *                       id: { type: integer, example: 4 }
 *                       user_name: { type: string, example: "Daniel Ortega" }
 *                       user_email: { type: string, example: "user@example.com" }
 *                   counts:
 *                     type: object
 *                     required: [members, files, votes]
 *                     properties:
 *                       members: { type: integer, example: 0 }
 *                       files: { type: integer, example: 2 }
 *                       votes: { type: integer, example: 3 }
 *                   files:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required: [id, original_name, mime_type, size_bytes, url]
 *                       properties:
 *                         id: { type: integer, example: 16 }
 *                         original_name: { type: string, example: "file.pdf" }
 *                         mime_type: { type: string, example: "application/pdf" }
 *                         size_bytes: { type: integer, example: 228827 }
 *                         url: { type: string, example: "http://localhost:80/uploads/submissions/10/file.pdf" }
 */
router.get("/", asyncHandler(Controller.list));

/**
 * @openapi
 * /public/submit:
 *   post:
 *     summary: Create a submission (individual or group)
 *     description: Accepts a cover image (single file) and any number of additional files.
 *     tags: [Public/Submissions]
 *     security:
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - award_id
 *               - owner_user_in_event_id
 *               - contact_name
 *               - contact_email
 *               - project_title
 *               - project_description
 *             properties:
 *               award_id: { type: integer }
 *               owner_user_in_event_id: { type: integer }
 *               is_group_submission: { type: boolean }
 *               members_user_in_event_ids:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items: { type: integer }
 *               contact_name: { type: string, maxLength: 120 }
 *               contact_email: { type: string, format: email, maxLength: 255 }
 *               project_title: { type: string, maxLength: 200 }
 *               project_description: { type: string }
 *               project_url: { type: string, nullable: true }
 *               cover_image:
 *                 type: string
 *                 format: binary
 *               files:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       401: { description: Session missing }
 *       403: { description: Invalid CSRF }
 *       429: { description: Rate limited }
 */
router.post("/submit", incomingUpload, asyncHandler(Controller.submit));

export default router;