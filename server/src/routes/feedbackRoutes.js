const express = require("express");
const router = express.Router();
const { getPublishedFeedbacks } = require("../controllers/feedbackController.js");

/**
 * @swagger
 * /api/feedbacks:
 *   get:
 *     summary: Get all published feedbacks/testimonials
 *     description: Retrieve all published feedbacks with pagination
 *     tags:
 *       - Feedbacks
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
 *           maximum: 50
 *         description: Items per page (max 50)
 *       - in: query
 *         name: minStars
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by minimum star rating
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, stars]
 *           default: createdAt
 *         description: Sort field
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     feedbacks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           quote:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           userRole:
 *                             type: string
 *                           stars:
 *                             type: integer
 *                           socialLinks:
 *                             type: object
 *                             properties:
 *                               whatsapp:
 *                                 type: string
 *                               instagram:
 *                                 type: string
 *                               facebook:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get("/", getPublishedFeedbacks);

module.exports = router;
