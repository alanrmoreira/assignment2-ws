import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { nomineeVotesController } from "../../controllers/public/nominee-votes-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/NomineeVotes
 *     description: Public nominee votes (anonymous session + CSRF)
 */

/**
 * @openapi
 * /public/votes:bulk:
 *   post:
 *     summary: Cast votes for nominees
 *     description: Accepts a single voter identified by user_sait_id and an array of votes. Each vote selects one nominee for a given award. Only one nominee per award is allowed per voter. Requires anonymous session cookie and CSRF token in X-CSRF-Token.
 *     tags: [Public/NomineeVotes]
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
 *                   required: [nominee_id, award_id]
 *                   properties:
 *                     nominee_id:
 *                       type: integer
 *                     award_id:
 *                       type: integer
 *           example:
 *             user_sait_id: "A00123456"
 *             votes:
 *               - nominee_id: 10
 *                 award_id: 3
 *               - nominee_id: 22
 *                 award_id: 7
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
router.post("/votes:bulk", asyncHandler(nomineeVotesController.bulk));

export default router;