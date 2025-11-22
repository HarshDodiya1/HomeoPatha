const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getDashboardStats,
  getRevenueAnalytics,
  getOrdersAnalytics,
  getAppointmentsAnalytics,
  getProductsAnalytics,
} = require("../../controllers/adminAnalyticsController.js");

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/admin/analytics/dashboard-stats:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/dashboard-stats", getDashboardStats);

/**
 * @swagger
 * /api/admin/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics over time
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/revenue", getRevenueAnalytics);

/**
 * @swagger
 * /api/admin/analytics/orders:
 *   get:
 *     summary: Get orders analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/orders", getOrdersAnalytics);

/**
 * @swagger
 * /api/admin/analytics/appointments:
 *   get:
 *     summary: Get appointments analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/appointments", getAppointmentsAnalytics);

/**
 * @swagger
 * /api/admin/analytics/products:
 *   get:
 *     summary: Get products analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/products", getProductsAnalytics);

module.exports = router;
