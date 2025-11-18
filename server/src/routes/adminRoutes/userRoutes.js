const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getAllPatients,
  getPatientDetails,
  updatePatient,
  deletePatient,
} = require("../../controllers/adminUserController.js");

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all patients (Admin only)
 *     description: Retrieve list of all patients with pagination and search
 *     tags:
 *       - Admin - Patients
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
 *         description: Search by name, email, or phone number
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
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
 *                   example: "Patients retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "PATIENTS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     patients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           role:
 *                             type: string
 *                           addresses:
 *                             type: array
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           stats:
 *                             type: object
 *                             properties:
 *                               totalOrders:
 *                                 type: number
 *                               totalAppointments:
 *                                 type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalPatients:
 *                           type: number
 *                         itemsPerPage:
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
router.get("/", authMiddleware, getAllPatients);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get specific patient details (Admin only)
 *     description: Retrieve complete details of a specific patient including stats and recent activity
 *     tags:
 *       - Admin - Patients
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
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
 *                   example: "Patient details retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "PATIENT_DETAILS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/User'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: number
 *                         totalAppointments:
 *                           type: number
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     recentAppointments:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid patient ID format or user is not a patient
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getPatientDetails);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update patient details (Admin only)
 *     description: Update patient's personal information
 *     tags:
 *       - Admin - Patients
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     addressLine1:
 *                       type: string
 *                       example: "123 Main St"
 *                     addressLine2:
 *                       type: string
 *                       example: "Apt 4B"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     state:
 *                       type: string
 *                       example: "NY"
 *                     pincode:
 *                       type: string
 *                       example: "10001"
 *                     isDefault:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       200:
 *         description: Patient updated successfully
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
 *                   example: "Patient updated successfully"
 *                 code:
 *                   type: string
 *                   example: "PATIENT_UPDATED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or invalid patient ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Patient not found
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updatePatient);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete patient (Admin only)
 *     description: Delete a patient account
 *     tags:
 *       - Admin - Patients
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
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
 *                   example: "Patient deleted successfully"
 *                 code:
 *                   type: string
 *                   example: "PATIENT_DELETED"
 *       400:
 *         description: Invalid patient ID format or user is not a patient
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deletePatient);

module.exports = router;
