const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../../controllers/adminDoctorController.js");

/**
 * @swagger
 * /api/admin/doctors:
 *   post:
 *     summary: Create a new doctor (Admin only)
 *     description: Create a new doctor account with user credentials and professional details
 *     tags:
 *       - Admin - Doctors
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
 *               - fullName
 *               - email
 *               - password
 *               - phoneNumber
 *               - specialization
 *               - qualification
 *               - experience
 *               - consultationFee
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Dr. John Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.smith@hospital.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               specialization:
 *                 type: string
 *                 example: "Cardiology"
 *               qualification:
 *                 type: string
 *                 example: "MD, DM (Cardiology)"
 *               experience:
 *                 type: number
 *                 example: 10
 *               consultationFee:
 *                 type: number
 *                 example: 500
 *               about:
 *                 type: string
 *                 example: "Experienced cardiologist specializing in heart diseases"
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createDoctor);

/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   put:
 *     summary: Update doctor details (Admin only)
 *     description: Update doctor's professional and personal information
 *     tags:
 *       - Admin - Doctors
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               specialization:
 *                 type: string
 *               qualification:
 *                 type: string
 *               experience:
 *                 type: number
 *               consultationFee:
 *                 type: number
 *               about:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       400:
 *         description: Validation error or invalid doctor ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateDoctor);

/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor (Admin only)
 *     description: Delete doctor and associated user account
 *     tags:
 *       - Admin - Doctors
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       400:
 *         description: Invalid doctor ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteDoctor);

module.exports = router;
