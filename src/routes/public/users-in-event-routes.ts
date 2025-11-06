import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { publicUsersInEventController } from "../../controllers/public/users-in-event-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Public/UsersInEvent
 *     description: Public users in event
 */

/**
 * @openapi
 * /public/event-editions/{event_edition_id}/users_in_event:
 *   get:
 *     summary: List users with submit permission for an event edition
 *     tags: [Public/UsersInEvent]
 *     parameters:
 *       - in: path
 *         name: event_edition_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of users with submit permission
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [id, event_edition_id, user_name, user_email, user_permission]
 *                 properties:
 *                   id: { type: integer, example: 12 }
 *                   event_edition_id: { type: integer, example: 1 }
 *                   user_name: { type: string, example: "Alex Johnson" }
 *                   user_email: { type: string, example: "alex.johnson@sait.ca" }
 *                   user_sait_id: { type: string, nullable: true, example: "SAIT123" }
 *                   user_permission: { type: string, example: "submit" }
 */
router.get(
    "/event-editions/:event_edition_id/users_in_event",
    asyncHandler(publicUsersInEventController.listSubmitters)
);

export default router;