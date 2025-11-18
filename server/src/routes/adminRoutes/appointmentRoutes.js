const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../../controllers/adminAppointmentController.js");

/**
 * @swagger
 * /api/admin/appointments:
 *   get:
 *     summary: Get all appointments (Admin only)
 *     description: Retrieve list of all appointments with advanced filtering, pagination, search, and statistics
 *     tags:
 *       - Admin - Appointments
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
 *           maximum: 100
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name, email, or phone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled, rescheduled]
 *         description: Filter by appointment status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by doctor ID
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date onwards
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments up to this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [appointmentDate, createdAt, status, consultationFee]
 *           default: appointmentDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
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
 *                   example: "Appointments retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "APPOINTMENTS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalAppointments:
 *                           type: number
 *                         itemsPerPage:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalAppointments:
 *                           type: number
 *                         pendingAppointments:
 *                           type: number
 *                         confirmedAppointments:
 *                           type: number
 *                         completedAppointments:
 *                           type: number
 *                         cancelledAppointments:
 *                           type: number
 *                         totalRevenue:
 *                           type: number
 *                         pendingPayments:
 *                           type: number
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAllAppointments);

/**
 * @swagger
 * /api/admin/appointments/{id}:
 *   get:
 *     summary: Get specific appointment (Admin only)
 *     description: Retrieve complete details of a specific appointment
 *     tags:
 *       - Admin - Appointments
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
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getAppointmentById);

/**
 * @swagger
 * /api/admin/appointments/{id}:
 *   put:
 *     summary: Update appointment details (Admin only)
 *     description: Update appointment information including rescheduling
 *     tags:
 *       - Admin - Appointments
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
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-25"
 *               appointmentTime:
 *                 type: string
 *                 example: "10:00 AM"
 *               duration:
 *                 type: number
 *                 example: 30
 *               reason:
 *                 type: string
 *                 example: "Follow-up consultation"
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled, rescheduled]
 *                 example: "confirmed"
 *               consultationFee:
 *                 type: number
 *                 example: 500
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *                 example: "completed"
 *               notes:
 *                 type: string
 *                 example: "Patient requested earlier time"
 *               prescription:
 *                 type: string
 *                 example: "Medicine details here"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Appointment updated successfully"
 *                 code:
 *                   type: string
 *                   example: "APPOINTMENT_UPDATED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or invalid appointment ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Time slot already booked
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateAppointment);

/**
 * @swagger
 * /api/admin/appointments/{id}/status:
 *   put:
 *     summary: Update appointment status (Admin only)
 *     description: Update only the status of an appointment (confirm, complete, cancel, etc.)
 *     tags:
 *       - Admin - Appointments
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
 *                 description: New appointment status
 *                 example: "confirmed"
 *               cancelReason:
 *                 type: string
 *                 description: Reason for cancellation (required if status is cancelled)
 *                 example: "Patient requested cancellation"
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
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
 *                   example: "Appointment status updated to confirmed"
 *                 code:
 *                   type: string
 *                   example: "APPOINTMENT_STATUS_UPDATED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put("/:id/status", authMiddleware, updateAppointmentStatus);

/**
 * @swagger
 * /api/admin/appointments/{id}:
 *   delete:
 *     summary: Delete appointment (Admin only)
 *     description: Permanently delete an appointment from the system
 *     tags:
 *       - Admin - Appointments
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
 *         description: Appointment deleted successfully
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
 *                   example: "Appointment deleted successfully"
 *                 code:
 *                   type: string
 *                   example: "APPOINTMENT_DELETED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedAppointment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         patientId:
 *                           type: string
 *                         doctorId:
 *                           type: string
 *                         appointmentDate:
 *                           type: string
 *                         status:
 *                           type: string
 *       400:
 *         description: Invalid appointment ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteAppointment);

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - appointmentDate
 *         - appointmentTime
 *         - reason
 *         - consultationFee
 *       properties:
 *         _id:
 *           type: string
 *           description: Appointment ID
 *         patientId:
 *           type: object
 *           description: Patient details
 *         doctorId:
 *           type: object
 *           description: Doctor details
 *         appointmentDate:
 *           type: string
 *           format: date
 *           description: Date of appointment
 *         appointmentTime:
 *           type: string
 *           description: Time of appointment
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *           default: 30
 *         reason:
 *           type: string
 *           description: Reason for appointment
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled, rescheduled]
 *           description: Appointment status
 *         consultationFee:
 *           type: number
 *           description: Consultation fee amount
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           description: Payment status
 *         paymentDetails:
 *           type: object
 *           description: Payment gateway details
 *         notes:
 *           type: string
 *           description: Additional notes
 *         prescription:
 *           type: string
 *           description: Prescription details
 *         cancelledBy:
 *           type: string
 *           enum: [patient, doctor, admin]
 *           description: Who cancelled the appointment
 *         cancelReason:
 *           type: string
 *           description: Reason for cancellation
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

module.exports = router;
