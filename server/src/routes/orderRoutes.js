const express = require("express");
const router = express.Router();
const {
  createOrderForCheckout,
  verifyOrderPayment,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
} = require("../controllers/orderController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

// All routes require authentication
router.use(authMiddleware);

// Create order and get Razorpay order ID
router.post("/create-order", createOrderForCheckout);

// Verify payment after Razorpay payment
router.post("/verify-payment", verifyOrderPayment);

// Get user's orders
router.get("/", getUserOrders);

// Get order details
router.get("/:id", getOrderDetails);

// Cancel order
router.put("/:id/cancel", cancelOrder);

module.exports = router;
