const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  bookAppointment,
  getAppointmentDetails,
} = require("../controllers/appointmentController.js");

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book new appointment
 *     description: Patient can book a new appointment with a doctor
 *     tags:
 *       - Appointments
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
 *               - doctorId
 *               - appointmentDate
 *               - appointmentTime
 *               - reason
 *               - consultationFee
 *             properties:
 *               doctorId:
 *                 type: string
 *                 description: ID of the doctor
 *                 example: "6475a9b8c1234567890abcde"
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of appointment
 *                 example: "2025-11-25"
 *               appointmentTime:
 *                 type: string
 *                 description: Time of appointment
 *                 example: "10:00 AM"
 *               duration:
 *                 type: number
 *                 description: Duration in minutes
 *                 example: 30
 *               reason:
 *                 type: string
 *                 description: Reason for appointment
 *                 example: "Regular checkup and consultation"
 *               consultationFee:
 *                 type: number
 *                 description: Consultation fee amount
 *                 example: 500
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *                 example: "First visit"
 *     responses:
 *       201:
 *         description: Appointment booked successfully
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
 *                   example: "Appointment booked successfully"
 *                 code:
 *                   type: string
 *                   example: "APPOINTMENT_BOOKED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only patients can book appointments
 *       404:
 *         description: Doctor not found
 *       409:
 *         description: Time slot already booked
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, bookAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment details
 *     description: Retrieve details of a specific appointment. Patients can only view their own appointments, admins can view all.
 *     tags:
 *       - Appointments
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
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully
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
 *                   example: "Appointment details retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "APPOINTMENT_DETAILS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid appointment ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this appointment
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getAppointmentDetails);

module.exports = router;
