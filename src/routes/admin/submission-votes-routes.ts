import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { submissionVotesController } from "../../controllers/admin/submission-votes-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin/SubmissionVotes
 *     description: Admin submission vote totals
 */

/**
 * @openapi
 * /admin/votes/submissions/event-editions/{submission_id}/totals:
 *   get:
 *     summary: Totals of submission votes by award for an event edition
 *     tags: [Admin/SubmissionVotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submission_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: awardId
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Invalid request }
 *       401: { description: Unauthorized }
 */
router.get("/submissions/event-editions/:id/totals", asyncHandler(submissionVotesController.totalsByEdition));

export default router;