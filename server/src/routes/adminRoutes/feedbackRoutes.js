const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  togglePublishStatus,
} = require("../../controllers/adminFeedbackController.js");

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
 *         - quote
 *         - stars
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         quote:
 *           type: string
 *           description: The feedback/testimonial text
 *         userName:
 *           type: string
 *           description: Name of the person giving feedback
 *         userRole:
 *           type: string
 *           description: Role/title of the person (e.g., "Customer", "Founder @ XYZ")
 *         stars:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Star rating from 1-5
 *         socialLinks:
 *           type: object
 *           properties:
 *             whatsapp:
 *               type: string
 *             instagram:
 *               type: string
 *             facebook:
 *               type: string
 *         isPublished:
 *           type: boolean
 *           description: Whether the feedback is published
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/admin/feedbacks:
 *   get:
 *     summary: Get all feedbacks with pagination and filters (Admin only)
 *     tags: [Admin - Feedbacks]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by userName, quote, or userRole
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: stars
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by star rating
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, stars, userName]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAllFeedbacks);

/**
 * @swagger
 * /api/admin/feedbacks/{id}:
 *   get:
 *     summary: Get specific feedback by ID (Admin only)
 *     tags: [Admin - Feedbacks]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback details retrieved successfully
 *       400:
 *         description: Invalid feedback ID
 *       403:
 *         description: Access denied
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getFeedbackById);

/**
 * @swagger
 * /api/admin/feedbacks:
 *   post:
 *     summary: Create a new feedback (Admin only)
 *     tags: [Admin - Feedbacks]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quote
 *               - stars
 *             properties:
 *               quote:
 *                 type: string
 *               userName:
 *                 type: string
 *               userRole:
 *                 type: string
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   whatsapp:
 *                     type: string
 *                   instagram:
 *                     type: string
 *                   facebook:
 *                     type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createFeedback);

/**
 * @swagger
 * /api/admin/feedbacks/{id}:
 *   put:
 *     summary: Update a feedback (Admin only)
 *     tags: [Admin - Feedbacks]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quote:
 *                 type: string
 *               userName:
 *                 type: string
 *               userRole:
 *                 type: string
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   whatsapp:
 *                     type: string
 *                   instagram:
 *                     type: string
 *                   facebook:
 *                     type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateFeedback);

/**
 * @swagger
 * /api/admin/feedbacks/{id}:
 *   delete:
 *     summary: Delete a feedback (Admin only)
 *     tags: [Admin - Feedbacks]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       400:
 *         description: Invalid feedback ID
 *       403:
 *         description: Access denied
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteFeedback);

/**
 * @swagger
 * /api/admin/feedbacks/{id}/toggle-publish:
 *   put:
 *     summary: Toggle feedback publish status (Admin only)
 *     tags: [Admin - Feedbacks]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback publish status toggled successfully
 *       400:
 *         description: Invalid feedback ID
 *       403:
 *         description: Access denied
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.put("/:id/toggle-publish", authMiddleware, togglePublishStatus);

module.exports = router;
