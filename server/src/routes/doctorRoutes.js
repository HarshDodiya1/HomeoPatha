const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  getAllDoctors,
  getDoctorDetails,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/doctorController.js");

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     description: Retrieve list of all doctors with optional filters and pagination
 *     tags:
 *       - Doctors
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
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Filter by minimum rating
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
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
 *                     doctors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Doctor'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid pagination parameters
 *       500:
 *         description: Server error
 */
router.get("/", getAllDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get specific doctor details
 *     description: Retrieve complete details of a specific doctor
 *     tags:
 *       - Doctors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor details retrieved successfully
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
 *                     doctor:
 *                       $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Invalid doctor ID format
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getDoctorDetails);

/**
 * @swagger
 * /api/doctors/profile:
 *   put:
 *     summary: Update doctor profile
 *     description: Update doctor's professional information
 *     tags:
 *       - Doctors
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
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
 *         description: Doctor profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor profile not found
 *       500:
 *         description: Server error
 */
router.put("/profile", authMiddleware, updateDoctorProfile);

/**
 * @swagger
 * /api/doctors/appointments:
 *   get:
 *     summary: Get doctor's appointments
 *     description: Retrieve all appointments for authenticated doctor with pagination and filtering
 *     tags:
 *       - Doctors
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled, rescheduled]
 *         description: Filter by appointment status
 *     responses:
 *       200:
 *         description: Doctor appointments retrieved successfully
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
 *                     appointments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor profile not found
 *       500:
 *         description: Server error
 */
router.get("/appointments", authMiddleware, getDoctorAppointments);

/**
 * @swagger
 * /api/doctors/appointments/{id}:
 *   put:
 *     summary: Update appointment status and notes
 *     description: Update appointment status, notes, and prescription by doctor
 *     tags:
 *       - Doctors
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled, rescheduled]
 *                 example: "completed"
 *               notes:
 *                 type: string
 *               prescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
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
 *                     appointment:
 *                       $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put("/appointments/:id", authMiddleware, updateAppointmentStatus);

module.exports = router;
