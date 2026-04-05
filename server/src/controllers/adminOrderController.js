const Order = require("../models/Order.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const Counter = require("../models/Counter.js");
const bcryptjs = require("bcryptjs");
const { generateInvoiceHTML } = require("../utils/invoiceGenerator.js");

async function generateInvoiceNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "invoiceNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `HP-${String(counter.seq).padStart(6, "0")}`;
}

/**
 * @desc Get all orders (Admin)
 * @route GET /api/admin/orders
 * @access Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      orderStatus,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    // Filters
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get orders with user details
    let orders = await Order.find(query)
      .populate("userId", "fullName email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        order.userId?.fullName?.toLowerCase().includes(searchLower) ||
        order.userId?.email?.toLowerCase().includes(searchLower) ||
        order._id.toString().includes(searchLower)
      );
    }

    const totalOrders = await Order.countDocuments(query);

    // Calculate stats
    const stats = {
      totalOrders: await Order.countDocuments(),
      pendingOrders: await Order.countDocuments({ orderStatus: "pending" }),
      confirmedOrders: await Order.countDocuments({ orderStatus: "confirmed" }),
      shippedOrders: await Order.countDocuments({ orderStatus: "shipped" }),
      deliveredOrders: await Order.countDocuments({ orderStatus: "delivered" }),
      cancelledOrders: await Order.countDocuments({ orderStatus: "cancelled" }),
      totalRevenue: (await Order.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]))[0]?.total || 0,
      pendingPayments: (await Order.aggregate([
        { $match: { paymentStatus: "pending" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]))[0]?.total || 0,
    };

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      code: "ORDERS_RETRIEVED",
      data: {
        orders,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalOrders,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving orders",
      code: "ORDERS_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Get order by ID (Admin)
 * @route GET /api/admin/orders/:id
 * @access Admin
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("userId", "fullName email phoneNumber");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      code: "ORDER_RETRIEVED",
      data: { order },
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving order",
      code: "ORDER_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Update order status (Admin)
 * @route PUT /api/admin/orders/:id/status
 * @access Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, adminNotes, estimatedDelivery, shippingCharges } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
        code: "STATUS_REQUIRED",
      });
    }

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        code: "INVALID_STATUS",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    order.orderStatus = orderStatus;
    if (adminNotes) order.adminNotes = adminNotes;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (shippingCharges !== undefined && shippingCharges !== null) {
      const oldShipping = order.shippingCharges || 0;
      const newShipping = Number(shippingCharges) || 0;
      order.shippingCharges = newShipping;
      order.totalAmount = order.totalAmount - oldShipping + newShipping;
    }

    // Update timestamps based on status
    if (orderStatus === "confirmed" && !order.confirmedAt) {
      order.confirmedAt = new Date();
    }
    if (orderStatus === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (orderStatus === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    if (orderStatus === "cancelled" && !order.cancelledAt) {
      order.cancelledAt = new Date();
      
      // Restore product stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      code: "ORDER_STATUS_UPDATED",
      data: { order },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating order status",
      code: "ORDER_STATUS_UPDATE_ERROR",
    });
  }
};

/**
 * @desc Update payment status (Admin)
 * @route PUT /api/admin/orders/:id/payment-status
 * @access Admin
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
        code: "PAYMENT_STATUS_REQUIRED",
      });
    }

    const validStatuses = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
        code: "INVALID_PAYMENT_STATUS",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      code: "PAYMENT_STATUS_UPDATED",
      data: { order },
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating payment status",
      code: "PAYMENT_STATUS_UPDATE_ERROR",
    });
  }
};

/**
 * @desc Delete order (Admin)
 * @route DELETE /api/admin/orders/:id
 * @access Admin
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    await Order.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      code: "ORDER_DELETED",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting order",
      code: "ORDER_DELETE_ERROR",
    });
  }
};

/**
 * @desc Create manual order/invoice (Admin)
 * @route POST /api/admin/orders/manual
 * @access Admin
 */
const createManualOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingDetails,
      orderItems,
      paymentMethod,
      paymentStatus,
      orderStatus,
      adminNotes,
      estimatedDelivery,
      shippingCharges: reqShippingCharges,
    } = req.body;

    const shippingCharges = Number(reqShippingCharges) || 0;

    // Validation
    if (!customerName || !customerPhone || !shippingAddress || !orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer details, shipping address, and order items are required",
        code: "VALIDATION_ERROR",
      });
    }

    // Create or find user
    let user = await User.findOne({ phoneNumber: customerPhone });
    
    if (!user) {
      // Create a new user for cash payment
      user = await User.create({
        fullName: customerName,
        email: customerEmail || `cash_${Date.now()}@homeopatha.com`,
        phoneNumber: customerPhone,
        password: bcryptjs.hashSync(Math.random().toString(36), 10),
        role: "patient",
        addresses: [{
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          isDefault: true,
        }],
      });
    }

    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0) + shippingCharges;

    const invoiceNumber = await generateInvoiceNumber();

    // Create order
    const order = await Order.create({
      invoiceNumber,
      userId: user._id,
      orderItems: orderItems.map(item => ({
        productId: item.productId || null,
        title: item.title,
        hsnCode: item.hsnCode || "",
        quantity: item.quantity,
        price: item.price,
        image: item.image || "",
      })),
      shippingAddress: {
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
      billingDetails: billingDetails ? {
        accName: billingDetails.accName || "",
        accNo: billingDetails.accNo || "",
        ifsc: billingDetails.ifsc || "",
        branch: billingDetails.branch || "",
        gstin: billingDetails.gstin || "",
      } : undefined,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentStatus || "completed",
      shippingCharges,
      totalAmount,
      orderStatus: orderStatus || "confirmed",
      adminNotes: adminNotes || "",
      estimatedDelivery: estimatedDelivery || null,
      confirmedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Manual order created successfully",
      code: "ORDER_CREATED",
      data: { order },
    });
  } catch (error) {
    console.error("Create manual order error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating order",
      code: "ORDER_CREATE_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Get order invoice as HTML (Admin)
 * @route GET /api/admin/orders/:id/invoice
 * @access Admin
 */
const getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invoice not available for cancelled orders",
        code: "INVOICE_NOT_AVAILABLE",
      });
    }

    const user = await User.findById(order.userId).select("fullName email phoneNumber");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    const invoiceHTML = generateInvoiceHTML(order, user);

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(invoiceHTML);
  } catch (error) {
    console.error("Get admin invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating invoice",
      code: "INVOICE_ERROR",
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderInvoice,
  createManualOrder,
};
