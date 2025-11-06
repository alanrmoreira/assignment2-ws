import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { submissionVotesController } from "../../controllers/public/submission-votes-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/SubmissionVotes
 *     description: Public submission votes
 */

/**
 * @openapi
 * /public/submission-votes:bulk:
 *   post:
 *     summary: Cast votes for submissions
 *     description: Accepts a single voter identified by user_sait_id and an array of votes. Each vote selects one submission for a given award. Only one submission per award is allowed per voter. Requires anonymous session cookie and CSRF token in X-CSRF-Token.
 *     tags: [Public/SubmissionVotes]
 *     security:
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_sait_id, votes]
 *             properties:
 *               user_sait_id:
 *                 type: string
 *               votes:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [submission_id, award_id]
 *                   properties:
 *                     submission_id:
 *                       type: integer
 *                     award_id:
 *                       type: integer
 *           example:
 *             user_sait_id: "A00123456"
 *             votes:
 *               - submission_id: 5
 *                 award_id: 2
 *               - submission_id: 8
 *                 award_id: 4
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Session missing
 *       403:
 *         description: Invalid CSRF
 *       404:
 *         description: Not found
 *       409:
 *         description: Already voted for this award
 */
router.post("/submission-votes:bulk", asyncHandler(submissionVotesController.bulk));

export default router;