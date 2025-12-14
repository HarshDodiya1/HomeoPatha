const express = require("express");
const router = express.Router();
const {
  getActiveSpecializations,
  getSpecializationWithQuestions,
} = require("../controllers/specializationController.js");

/**
 * @swagger
 * /api/specializations:
 *   get:
 *     summary: Get all active specializations
 *     description: Retrieve list of active specializations for appointment booking
 *     tags:
 *       - Specializations
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, description, or tags
 *     responses:
 *       200:
 *         description: Specializations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                             nullable: true
 *                           consultationFee:
 *                             type: number
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                     pagination:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get("/", getActiveSpecializations);

/**
 * @swagger
 * /api/specializations/{id}:
 *   get:
 *     summary: Get specialization with questions
 *     description: Retrieve specific specialization details with associated questions
 *     tags:
 *       - Specializations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialization ID
 *     responses:
 *       200:
 *         description: Specialization retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     specialization:
 *                       type: object
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           question:
 *                             type: string
 *                           questionType:
 *                             type: string
 *                           options:
 *                             type: array
 *                           isRequired:
 *                             type: boolean
 *                           placeholder:
 *                             type: string
 *       400:
 *         description: Invalid specialization ID format
 *       404:
 *         description: Specialization not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getSpecializationWithQuestions);

module.exports = router;
