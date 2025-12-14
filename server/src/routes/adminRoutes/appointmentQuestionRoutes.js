const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} = require("../../controllers/adminAppointmentQuestionController.js");

/**
 * @swagger
 * /api/admin/appointment-questions:
 *   post:
 *     summary: Create a new appointment question (Admin only)
 *     description: Create a new question for appointment booking
 *     tags:
 *       - Admin - Appointment Questions
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
 *               - question
 *               - questionType
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question text
 *                 example: "What symptoms are you experiencing?"
 *               questionType:
 *                 type: string
 *                 enum: [text, textarea, select, checkbox, radio, date, number]
 *                 description: Type of question
 *                 example: "textarea"
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Options for select/checkbox/radio types
 *                 example: ["Option 1", "Option 2"]
 *               isRequired:
 *                 type: boolean
 *                 description: Whether the question is required
 *                 example: true
 *               specializationId:
 *                 type: string
 *                 description: Specialization ID (null for global questions)
 *                 example: null
 *               order:
 *                 type: number
 *                 description: Display order
 *                 example: 1
 *               placeholder:
 *                 type: string
 *                 description: Placeholder text
 *                 example: "Describe your symptoms..."
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Specialization not found
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createQuestion);

/**
 * @swagger
 * /api/admin/appointment-questions:
 *   get:
 *     summary: Get all appointment questions (Admin only)
 *     description: Retrieve list of all questions with pagination and filters
 *     tags:
 *       - Admin - Appointment Questions
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
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: specializationId
 *         schema:
 *           type: string
 *         description: Filter by specialization (use 'global' for global questions)
 *       - in: query
 *         name: questionType
 *         schema:
 *           type: string
 *         description: Filter by question type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in question text
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAllQuestions);

/**
 * @swagger
 * /api/admin/appointment-questions/reorder:
 *   put:
 *     summary: Reorder questions (Admin only)
 *     description: Update the display order of multiple questions
 *     tags:
 *       - Admin - Appointment Questions
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
 *               - orders
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Questions reordered successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.put("/reorder", authMiddleware, reorderQuestions);

/**
 * @swagger
 * /api/admin/appointment-questions/{id}:
 *   get:
 *     summary: Get question by ID (Admin only)
 *     description: Retrieve specific question details
 *     tags:
 *       - Admin - Appointment Questions
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getQuestionById);

/**
 * @swagger
 * /api/admin/appointment-questions/{id}:
 *   put:
 *     summary: Update question (Admin only)
 *     description: Update an existing question
 *     tags:
 *       - Admin - Appointment Questions
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               questionType:
 *                 type: string
 *                 enum: [text, textarea, select, checkbox, radio, date, number]
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               isRequired:
 *                 type: boolean
 *               specializationId:
 *                 type: string
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               placeholder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Invalid ID format or validation error
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateQuestion);

/**
 * @swagger
 * /api/admin/appointment-questions/{id}:
 *   delete:
 *     summary: Delete question (Admin only)
 *     description: Delete an appointment question
 *     tags:
 *       - Admin - Appointment Questions
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteQuestion);

module.exports = router;
