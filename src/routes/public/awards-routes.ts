import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { publicAwardsController } from "../../controllers/public/awards-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/Awards
 *     description: Public awards
 */

/**
 * @openapi
 * /public/awards/event_id/{event_id}:
 *   get:
 *     summary: List awards for an event edition (public)
 *     tags: [Public/Awards]
 *     parameters:
 *       - in: path
 *         name: event_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Awards for the given event edition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [event_id, year, awards]
 *               properties:
 *                 event_id:
 *                   type: integer
 *                   example: 1
 *                 year:
 *                   type: integer
 *                   example: 2025
 *                 awards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required: [id, event_edition_id, category_name]
 *                     properties:
 *                       id: { type: integer, example: 7 }
 *                       event_edition_id: { type: integer, example: 1 }
 *                       category_name: { type: string, example: "Backend beast" }
 *       404: { description: Event edition not found }
 */
router.get("/awards/event_id/:event_id", asyncHandler(publicAwardsController.listByEventEdition));

export default router;