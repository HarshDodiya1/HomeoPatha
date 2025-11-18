const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getAllContactMessages,
  getContactMessageById,
  deleteContactMessage,
} = require("../../controllers/adminContactController.js");

/**
 * @swagger
 * /api/admin/contacts:
 *   get:
 *     summary: Get all contact messages (Admin only)
 *     description: Retrieve list of all contact messages with pagination, search, and statistics
 *     tags:
 *       - Admin - Contacts
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
 *           maximum: 100
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, phone, or message content
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email address
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter messages from this date onwards
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter messages up to this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, fullName, email]
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
 *         description: Contact messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact messages retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "CONTACT_MESSAGES_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactMessages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContactMessage'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalMessages:
 *                           type: number
 *                         itemsPerPage:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalMessages:
 *                           type: number
 *                         messagesThisMonth:
 *                           type: number
 *                         messagesThisWeek:
 *                           type: number
 *                         messagesToday:
 *                           type: number
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAllContactMessages);

/**
 * @swagger
 * /api/admin/contacts/{id}:
 *   get:
 *     summary: Get specific contact message (Admin only)
 *     description: Retrieve complete details of a specific contact message
 *     tags:
 *       - Admin - Contacts
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact message ID
 *     responses:
 *       200:
 *         description: Contact message details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact message details retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "CONTACT_MESSAGE_DETAILS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactMessage:
 *                       $ref: '#/components/schemas/ContactMessage'
 *       400:
 *         description: Invalid contact message ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Contact message not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getContactMessageById);

/**
 * @swagger
 * /api/admin/contacts/{id}:
 *   delete:
 *     summary: Delete contact message (Admin only)
 *     description: Permanently delete a contact message from the system
 *     tags:
 *       - Admin - Contacts
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact message ID
 *     responses:
 *       200:
 *         description: Contact message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact message deleted successfully"
 *                 code:
 *                   type: string
 *                   example: "CONTACT_MESSAGE_DELETED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedMessage:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *       400:
 *         description: Invalid contact message ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Contact message not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteContactMessage);

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactMessage:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phoneNumber
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Contact message ID
 *         fullName:
 *           type: string
 *           description: Full name of the person
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *           example: "john.doe@example.com"
 *         phoneNumber:
 *           type: string
 *           description: Phone number
 *           example: "9876543210"
 *         message:
 *           type: string
 *           description: Contact message content
 *           example: "I would like to inquire about your services..."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message submission timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

module.exports = router;
