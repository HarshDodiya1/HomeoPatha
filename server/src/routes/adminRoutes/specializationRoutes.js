const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  createSpecialization,
  getAllSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
} = require("../../controllers/adminSpecializationController.js");

/**
 * @swagger
 * /api/admin/specializations:
 *   post:
 *     summary: Create a new specialization (Admin only)
 *     description: Create a new appointment specialization/category
 *     tags:
 *       - Admin - Specializations
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
 *               - name
 *               - description
 *               - consultationFee
 *             properties:
 *               name:
 *                 type: string
 *                 description: Specialization name
 *                 example: "Cardiology"
 *               description:
 *                 type: string
 *                 description: Detailed description
 *                 example: "Heart and cardiovascular system related consultations"
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: Image URL for the specialization
 *                 example: "https://example.com/cardiology.jpg"
 *               consultationFee:
 *                 type: number
 *                 description: Consultation fee
 *                 example: 500
 *               isActive:
 *                 type: boolean
 *                 description: Whether the specialization is active
 *                 example: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Related tags
 *                 example: ["heart", "cardiovascular", "chest pain"]
 *     responses:
 *       201:
 *         description: Specialization created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Specialization already exists
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createSpecialization);

/**
 * @swagger
 * /api/admin/specializations:
 *   get:
 *     summary: Get all specializations (Admin only)
 *     description: Retrieve list of all specializations with pagination
 *     tags:
 *       - Admin - Specializations
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, description, or tags
 *     responses:
 *       200:
 *         description: Specializations retrieved successfully
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAllSpecializations);

/**
 * @swagger
 * /api/admin/specializations/{id}:
 *   get:
 *     summary: Get specialization by ID (Admin only)
 *     description: Retrieve specific specialization with associated questions
 *     tags:
 *       - Admin - Specializations
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
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
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Specialization not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getSpecializationById);

/**
 * @swagger
 * /api/admin/specializations/{id}:
 *   put:
 *     summary: Update specialization (Admin only)
 *     description: Update an existing specialization
 *     tags:
 *       - Admin - Specializations
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *               consultationFee:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Specialization updated successfully
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Specialization not found
 *       409:
 *         description: Duplicate name
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateSpecialization);

/**
 * @swagger
 * /api/admin/specializations/{id}:
 *   delete:
 *     summary: Delete specialization (Admin only)
 *     description: Delete a specialization and its specific questions
 *     tags:
 *       - Admin - Specializations
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialization ID
 *     responses:
 *       200:
 *         description: Specialization deleted successfully
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Specialization not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteSpecialization);

module.exports = router;
