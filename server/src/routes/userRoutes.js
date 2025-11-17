const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getOrderDetails,
  getUserAppointments,
  getAppointmentDetails,
} = require("../controllers/userController.js");

/**
 * All routes are Private (Requires Authentication)
 */
router.use(authMiddleware);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with all details
 * @access  Private (Patient)
 */
router.get("/profile", getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile (fullName, phoneNumber, addresses)
 * @access  Private (Patient)
 * @body    {fullName?, phoneNumber?, addresses?}
 */
router.put("/profile", updateUserProfile);

/**
 * @route   GET /api/users/orders
 * @desc    Get all user orders with pagination
 * @access  Private (Patient)
 * @query   page (default: 1), limit (default: 10)
 */
router.get("/orders", getUserOrders);

/**
 * @route   GET /api/users/orders/:id
 * @desc    Get specific order details
 * @access  Private (Patient)
 */
router.get("/orders/:id", getOrderDetails);

/**
 * @route   GET /api/users/appointments
 * @desc    Get all user appointments with pagination
 * @access  Private (Patient)
 * @query   page (default: 1), limit (default: 10)
 */
router.get("/appointments", getUserAppointments);

/**
 * @route   GET /api/users/appointments/:id
 * @desc    Get specific appointment details
 * @access  Private (Patient)
 */
router.get("/appointments/:id", getAppointmentDetails);

module.exports = router;
