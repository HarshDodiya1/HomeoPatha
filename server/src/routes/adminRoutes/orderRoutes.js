const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} = require("../../controllers/adminOrderController.js");
const authMiddleware = require("../../middleware/authMiddleware.js");

// All routes require authentication and admin role
router.use(authMiddleware);

// Get all orders
router.get("/", getAllOrders);

// Get order by ID
router.get("/:id", getOrderById);

// Update order status
router.put("/:id/status", updateOrderStatus);

// Update payment status
router.put("/:id/payment-status", updatePaymentStatus);

// Delete order
router.delete("/:id", deleteOrder);

module.exports = router;
