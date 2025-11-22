const express = require("express");
const router = express.Router();
const adminPaymentController = require("../../controllers/adminPaymentController");
const authMiddleware = require("../../middleware/authMiddleware.js");

/**
 * @swagger
 * tags:
 *   name: Admin Payments
 *   description: Admin payment management endpoints
 */

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get payment analytics
router.get("/analytics", adminPaymentController.getPaymentAnalytics);

// Get all payments list
router.get("/list", adminPaymentController.getAllPayments);

module.exports = router;
