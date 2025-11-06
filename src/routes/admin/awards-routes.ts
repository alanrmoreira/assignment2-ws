import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { awardsController } from "../../controllers/admin/awards-controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin/Awards
 *     description: Awards management
 */

/**
 * @openapi
 * /admin/awards/event_id/{event_id}:
 *   get:
 *     summary: List awards for an event edition
 *     tags: [Admin/Awards]
 *     security: [ { bearerAuth: [] } ]
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
 *                     required: [id, event_edition_id, category_name, award_name]
 *                     properties:
 *                       id: { type: integer, example: 7 }
 *                       event_edition_id: { type: integer, example: 1 }
 *                       category_name: { type: string, example: "web" }
 *                       award_name: { type: string, example: "Backend beast" }
 *   post:
 *     summary: Create award in an event edition
 *     tags: [Admin/Awards]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: event_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_name, award_name]
 *             properties:
 *               category_name: { type: string, maxLength: 120 }
 *               award_name: { type: string, maxLength: 120 }
 *     responses:
 *       201: { description: Created }
 *       404: { description: Event edition not found }
 *       409: { description: Category name already exists for this edition }
 */
router.get("/event_id/:event_id", asyncHandler(awardsController.list));
router.post("/event_id/:event_id", asyncHandler(awardsController.create));

/**
 * @openapi
 * /admin/awards/{id}:
 *   get:
 *     summary: Get an award by id
 *     tags: [Admin/Awards]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [id, event_edition_id, category_name, award_name]
 *               properties:
 *                 id: { type: integer, example: 7 }
 *                 event_edition_id: { type: integer, example: 1 }
 *                 category_name: { type: string, example: "web" }
 *                 award_name: { type: string, example: "Backend beast" }
 *       404: { description: Award not found }
 *   put:
 *     summary: Update an award
 *     tags: [Admin/Awards]
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
 *             required: [category_name, award_name]
 *             properties:
 *               category_name: { type: string, maxLength: 120 }
 *               award_name: { type: string, maxLength: 120 }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [id, event_edition_id, category_name, award_name]
 *               properties:
 *                 id: { type: integer, example: 7 }
 *                 event_edition_id: { type: integer, example: 1 }
 *                 category_name: { type: string, example: "web" }
 *                 award_name: { type: string, example: "Backend beast" }
 *       404: { description: Award not found }
 *       409: { description: Category name already exists for this edition }
 *   patch:
 *     summary: Patch an award
 *     tags: [Admin/Awards]
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
 *               category_name: { type: string, maxLength: 120 }
 *               award_name: { type: string, maxLength: 120 }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [id, event_edition_id, category_name, award_name]
 *               properties:
 *                 id: { type: integer, example: 7 }
 *                 event_edition_id: { type: integer, example: 1 }
 *                 category_name: { type: string, example: "web" }
 *                 award_name: { type: string, example: "Backend beast" }
 *       404: { description: Award not found }
 *       409: { description: Category name already exists for this edition }
 *   delete:
 *     summary: Delete an award
 *     tags: [Admin/Awards]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Award not found }
 */
router.get("/:id", asyncHandler(awardsController.get));
router.put("/:id", asyncHandler(awardsController.update));
router.patch("/:id", asyncHandler(awardsController.patch));
router.delete("/:id", asyncHandler(awardsController.remove));

export default router;