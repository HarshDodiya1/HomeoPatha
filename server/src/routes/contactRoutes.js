const express = require("express");
const router = express.Router();
const { submitContactMessage } = require("../controllers/contactController.js");

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact message
 *     description: Submit a contact form message (Public endpoint - no authentication required)
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phoneNumber
 *               - message
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the person
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john.doe@example.com"
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number (10 digits)
 *                 example: "9876543210"
 *               message:
 *                 type: string
 *                 description: Message content (10-1000 characters)
 *                 example: "I would like to inquire about your services..."
 *     responses:
 *       201:
 *         description: Contact message submitted successfully
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
 *                   example: "Your message has been sent successfully. We'll get back to you soon!"
 *                 code:
 *                   type: string
 *                   example: "CONTACT_MESSAGE_CREATED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactMessage:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "All fields are required"
 *                 code:
 *                   type: string
 *                   example: "MISSING_FIELDS"
 *       500:
 *         description: Server error
 */
router.post("/", submitContactMessage);

module.exports = router;
