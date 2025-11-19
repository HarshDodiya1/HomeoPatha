const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  createAppointmentOrder,
  verifyAppointmentPayment,
  getAppointmentDetails,
} = require("../controllers/appointmentController.js");

/**
 * @swagger
 * /api/appointments/create-order:
 *   post:
 *     summary: Create Razorpay order for appointment
 *     description: Patient creates an order for appointment booking. Consultation fee is fetched from server (doctor's profile).
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
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *                 example: "First visit"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Doctor not found
 *       409:
 *         description: Time slot already booked
 *       500:
 *         description: Server error
 */
router.post("/create-order", authMiddleware, createAppointmentOrder);

/**
 * @swagger
 * /api/appointments/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment and confirm appointment
 *     description: Verify payment signature and update appointment status
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
 *               - appointmentId
 *               - razorpayOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: Appointment ID
 *               razorpayOrderId:
 *                 type: string
 *                 description: Razorpay Order ID
 *               razorpayPaymentId:
 *                 type: string
 *                 description: Razorpay Payment ID
 *               razorpaySignature:
 *                 type: string
 *                 description: Razorpay Signature
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Validation error or invalid payment
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.post("/verify-payment", authMiddleware, verifyAppointmentPayment);

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
