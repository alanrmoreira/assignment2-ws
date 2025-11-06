import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { nomineesController } from "../../controllers/public/nominees-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Nominations
 *     description: Public nominations
 */

/**
 * @openapi
 * /public/event-editions/{event_edition_id}/nominees:
 *   get:
 *     summary: List nominees for an event edition (optional award filter)
 *     tags: [Public/Nominations]
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
 *       200: { description: OK }
 */
router.get("/event-editions/:id/nominees", asyncHandler(nomineesController.listByEdition));

/**
 * @openapi
 * /public/nominations:bulk:
 *   post:
 *     summary: Create nominations in bulk
 *     description: Session + CSRF required (applied globally for unsafe methods).
 *     tags: [Public/Nominations]
 *     security:
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event_edition_id, nominator_sait_id, nominations]
 *             properties:
 *               event_edition_id: { type: integer }
 *               nominator_sait_id: { type: string }
 *               nominations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [award_id, user_in_event_id]
 *                   properties:
 *                     award_id: { type: integer }
 *                     user_in_event_id: { type: integer }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       401: { description: Session missing }
 *       403: { description: Invalid CSRF }
 *       404: { description: Not found }
 *       409: { description: Nominator already submitted }
 *       429: { description: Rate limited }
 */
router.post("/nominations:bulk", asyncHandler(nomineesController.bulkCreate));

/**
 * @openapi
 * /public/event-editions/{event_edition_id}/awards/nomination-counts:
 *   get:
 *     summary: Nomination totals per award (optionally filter one award)
 *     tags: [Public/Nominations]
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
 *       200: { description: OK }
 */
router.get(
    "/event-editions/:id/awards/nomination-counts",
    asyncHandler(nomineesController.countsByAward)
);

export default router;