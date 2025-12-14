const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  createAppointmentOrder,
  verifyAppointmentPayment,
  getAppointmentDetails,
  getPatientAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController.js");

/**
 * @swagger
 * /api/appointments/create-order:
 *   post:
 *     summary: Create Razorpay order for appointment
 *     description: Patient creates an order for appointment booking by specialization
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
 *               - specializationId
 *             properties:
 *               specializationId:
 *                 type: string
 *                 description: ID of the specialization
 *                 example: "6475a9b8c1234567890abcde"
 *               questionResponses:
 *                 type: array
 *                 description: Answers to appointment questions
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Specialization not found
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
 * /api/appointments:
 *   get:
 *     summary: Get patient's appointments
 *     description: Retrieve all appointments for the logged-in patient
 *     tags:
 *       - Appointments
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
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getPatientAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment details
 *     description: Retrieve details of a specific appointment
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

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   put:
 *     summary: Cancel appointment
 *     description: Patient cancels their appointment
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Cancellation reason
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Invalid ID or already cancelled
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put("/:id/cancel", authMiddleware, cancelAppointment);

module.exports = router;
