import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { nomineeVotesController } from "../../controllers/admin/nominee-votes-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin/Votes
 *     description: Admin endpoints for vote totals
 */

/**
 * @openapi
 * /admin/votes/event-editions/{event_edition_id}/nominee-totals:
 *   get:
 *     summary: Get nominee vote totals grouped by award for an event edition
 *     description: Returns, per award, the list of nominees with their vote counts and the total per award. Optional filter by awardId.
 *     tags: [Admin/Votes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: event_edition_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: awardId
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event_edition_id: { type: integer }
 *                 award_id_filter: { type: integer }
 *                 awards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       award_id: { type: integer }
 *                       award_category_name: { type: string }
 *                       total_votes: { type: integer }
 *                       nominees:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             nominee_id: { type: integer }
 *                             user_in_event_id: { type: integer }
 *                             user_name: { type: string }
 *                             user_email: { type: string }
 *                             votes: { type: integer }
 *       400: { description: Invalid input }
 *       401: { description: Unauthorized }
 */
router.get(
    "/event-editions/:id/nominee-totals",
    asyncHandler(nomineeVotesController.totalsByEdition)
);

export default router;