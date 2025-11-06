import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { editionController } from "../../controllers/public/edition-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Edition
 *     description: Public edition status
 */

/**
 * @openapi
 * /public/edition/current:
 *   get:
 *     summary: Get current year edition status
 *     description: >
 *       Returns the current edition year and the state of submissions and votes windows.
 *       Each window can have one of the following statuses:
 *
 *       - **not_started** — the window has not opened yet
 *       - **opened** — the window is currently active
 *       - **closed** — the window has ended
 *
 *       If both submissions and votes are closed, the response also includes the list of winners.
 *     tags: [Public/Edition]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   required: [year, submissions, votes]
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2025
 *                     submissions:
 *                       type: string
 *                       enum: [not_started, opened, closed]
 *                     votes:
 *                       type: string
 *                       enum: [not_started, opened, closed]
 *                 - type: object
 *                   required: [year, submissions, votes, winners]
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2025
 *                     submissions:
 *                       type: string
 *                       enum: [not_started, opened, closed]
 *                     votes:
 *                       type: string
 *                       enum: [not_started, opened, closed]
 *                     winners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           award_id: { type: integer }
 *                           user_in_event_id: { type: integer }
 *                           is_group_submission: { type: boolean }
 *                           contact_name: { type: string }
 *                           contact_email: { type: string, format: email }
 *                           project_title: { type: string }
 *                           project_description: { type: string }
 *                           project_cover_image: { type: string, nullable: true }
 *                           project_url: { type: string, nullable: true }
 *                           status: { type: string }
 *                           reviewed_by_user_id: { type: integer, nullable: true }
 *                           reviewed_at: { type: string, format: date-time, nullable: true }
 *                           review_note: { type: string, nullable: true }
 *                           winner: { type: boolean }
 *                           submission_date: { type: string, format: date-time }
 *       404:
 *         description: Not found
 */
router.get("/edition/current", asyncHandler(editionController.current));

export default router;