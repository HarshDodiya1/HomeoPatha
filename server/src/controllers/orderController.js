const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const crypto = require("crypto");
const config = require("../config/config.js");
const Razorpay = require("razorpay");
const { generateInvoiceHTML } = require("../utils/invoiceGenerator.js");

/**
 * @desc Create order for checkout
 * @route POST /api/orders/create-order
 * @access Private
 */
const createOrderForCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, shippingCharges: reqShippingCharges } = req.body;
    const shippingCharges = Number(reqShippingCharges) || 0;

    // Validate shipping address
    if (!shippingAddress?.addressLine1 || !shippingAddress?.city || 
        !shippingAddress?.state || !shippingAddress?.pincode) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
        code: "INCOMPLETE_ADDRESS",
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title images currentPrice oldPrice isActive stock",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
        code: "EMPTY_CART",
      });
    }

    // Validate all products and calculate total from server
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product?.title || 'unknown'} is no longer available`,
          code: "PRODUCT_UNAVAILABLE",
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.title}`,
          code: "INSUFFICIENT_STOCK",
        });
      }

      const itemTotal = item.product.currentPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.product._id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.product.currentPrice,
        image: item.product.images?.[0] || "",
      });
    }

    totalAmount += shippingCharges;

    // For COD, create order directly and decrement stock
    if (paymentMethod === "cod") {
      const order = await Order.create({
        userId,
        orderItems,
        shippingAddress,
        paymentMethod: "cod",
        paymentStatus: "pending",
        shippingCharges,
        totalAmount,
        orderStatus: "confirmed",
      });

      // Decrement stock for all items
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear cart
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        code: "ORDER_CREATED",
        data: { 
          orderId: order._id,
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
        },
      });
    }

    // For Razorpay payment - create Razorpay order
    const razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });

    const razorpayOrderOptions = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId,
        orderType: "product_purchase",
      },
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

    // Create order in pending state
    const order = await Order.create({
      userId,
      orderItems,
      shippingAddress,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      paymentDetails: {
        razorpayOrderId: razorpayOrder.id,
      },
      shippingCharges,
      totalAmount,
      orderStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      code: "ORDER_CREATED",
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        currency: razorpayOrder.currency,
        keyId: config.razorpay.keyId, // Send only key ID, never secret
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating order",
      code: "ORDER_CREATE_ERROR",
    });
  }
};

/**
 * @desc Verify payment and confirm order
 * @route POST /api/orders/verify-payment
 * @access Private
 */
const verifyOrderPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Validate required fields
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
        code: "MISSING_PAYMENT_DETAILS",
      });
    }

    // Find order
    const order = await Order.findOne({ _id: orderId, userId }).populate({
      path: "orderItems.productId",
      select: "stock",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    // Verify order hasn't been processed already
    if (order.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Order already processed",
        code: "ORDER_ALREADY_PROCESSED",
      });
    }

    // Verify payment signature
    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature !== expectedSign) {
      order.paymentStatus = "failed";
      order.orderStatus = "payment_failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature",
        code: "INVALID_SIGNATURE",
      });
    }

    // Payment verified successfully
    order.paymentStatus = "completed";
    order.orderStatus = "confirmed";
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };

    await order.save();

    // Decrement stock for all items
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      code: "PAYMENT_VERIFIED",
      data: {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying payment",
      code: "PAYMENT_VERIFICATION_ERROR",
    });
  }
};

/**
 * @desc Get user's orders
 * @route GET /api/orders
 * @access Private
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ userId });

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      code: "ORDERS_RETRIEVED",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving orders",
      code: "ORDERS_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Get order details
 * @route GET /api/orders/:id
 * @access Private
 */
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        code: "ORDER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      code: "ORDER_DETAILS_RETRIEVED",
      data: { order },
    });
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving order details",
      code: "ORDER_DETAILS_ERROR",
    });
  }
};

/**
 * @desc Cancel order
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });

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
        message: "Order is already cancelled",
        code: "ORDER_ALREADY_CANCELLED",
      });
    }

    if (["delivered", "shipped"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order that is shipped or delivered",
        code: "CANNOT_CANCEL_ORDER",
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      code: "ORDER_CANCELLED",
      data: { order },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while cancelling order",
      code: "ORDER_CANCEL_ERROR",
    });
  }
};

/**
 * @desc Get order invoice as HTML
 * @route GET /api/orders/:id/invoice
 * @access Private
 */
const getOrderInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });

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

    const user = await User.findById(userId).select("fullName email phoneNumber");

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
    console.error("Get invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating invoice",
      code: "INVOICE_ERROR",
    });
  }
};

module.exports = {
  createOrderForCheckout,
  verifyOrderPayment,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  getOrderInvoice,
};
