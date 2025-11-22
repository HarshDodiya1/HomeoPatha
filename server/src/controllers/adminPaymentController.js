const Order = require("../models/Order");
const Appointment = require("../models/Appointment");

/**
 * @swagger
 * /api/admin/payments/analytics:
 *   get:
 *     summary: Get payment analytics
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment analytics data
 */
exports.getPaymentAnalytics = async (req, res) => {
  try {
    // Get payment statistics for orders
    const orderPayments = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
          razorpayCount: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "razorpay"] }, 1, 0] },
          },
          codCount: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "cod"] }, 1, 0] },
          },
          razorpayAmount: {
            $sum: {
              $cond: [
                { $eq: ["$paymentMethod", "razorpay"] },
                "$totalAmount",
                0,
              ],
            },
          },
          codAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "cod"] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]);

    // Get payment statistics for appointments
    const appointmentPayments = await Appointment.aggregate([
      {
        $match: {
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$consultationFee" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get payment status distribution for orders
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Get payment status distribution for appointments
    const appointmentStatusDistribution = await Appointment.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$consultationFee" },
        },
      },
    ]);

    // Get recent successful payments trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orderTrend = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          amount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const appointmentTrend = await Appointment.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          amount: { $sum: "$consultationFee" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const orderStats = orderPayments[0] || {
      totalAmount: 0,
      count: 0,
      razorpayCount: 0,
      codCount: 0,
      razorpayAmount: 0,
      codAmount: 0,
    };

    const appointmentStats = appointmentPayments[0] || {
      totalAmount: 0,
      count: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPayments:
            (orderStats.totalAmount || 0) + (appointmentStats.totalAmount || 0),
          totalTransactions:
            (orderStats.count || 0) + (appointmentStats.count || 0),
          orderPayments: {
            total: orderStats.totalAmount || 0,
            count: orderStats.count || 0,
            razorpayCount: orderStats.razorpayCount || 0,
            codCount: orderStats.codCount || 0,
            razorpayAmount: orderStats.razorpayAmount || 0,
            codAmount: orderStats.codAmount || 0,
          },
          appointmentPayments: {
            total: appointmentStats.totalAmount || 0,
            count: appointmentStats.count || 0,
          },
        },
        paymentStatusDistribution: {
          orders: orderStatusDistribution,
          appointments: appointmentStatusDistribution,
        },
        paymentTrend: {
          orders: orderTrend,
          appointments: appointmentTrend,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment analytics",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/admin/payments/list:
 *   get:
 *     summary: Get all payments list
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [order, appointment, all]
 *         description: Filter by payment type
 *     responses:
 *       200:
 *         description: List of all payments
 */
exports.getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { paymentStatus, type = "all" } = req.query;

    let payments = [];

    // Fetch order payments
    if (type === "all" || type === "order") {
      const orderQuery = {};
      if (paymentStatus) orderQuery.paymentStatus = paymentStatus;

      const orders = await Order.find(orderQuery)
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .skip(type === "order" ? skip : 0)
        .limit(type === "order" ? limit : 1000)
        .lean();

      const orderPayments = orders.map((order) => ({
        _id: order._id,
        type: "order",
        amount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails,
        customer: {
          name: order.userId?.fullName || "N/A",
          email: order.userId?.email || "N/A",
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderStatus: order.orderStatus,
        items: order.orderItems?.length || 0,
      }));

      payments = [...payments, ...orderPayments];
    }

    // Fetch appointment payments
    if (type === "all" || type === "appointment") {
      const appointmentQuery = {};
      if (paymentStatus) appointmentQuery.paymentStatus = paymentStatus;

      const appointments = await Appointment.find(appointmentQuery)
        .populate("patientId", "fullName email")
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 })
        .skip(type === "appointment" ? skip : 0)
        .limit(type === "appointment" ? limit : 1000)
        .lean();

      const appointmentPayments = appointments.map((appointment) => ({
        _id: appointment._id,
        type: "appointment",
        amount: appointment.consultationFee,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: "razorpay",
        paymentDetails: appointment.paymentDetails,
        customer: {
          name: appointment.patientId?.fullName || "N/A",
          email: appointment.patientId?.email || "N/A",
        },
        doctor: {
          name: appointment.doctorId?.name || "N/A",
          specialization: appointment.doctorId?.specialization || "N/A",
        },
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentStatus: appointment.status,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      }));

      payments = [...payments, ...appointmentPayments];
    }

    // Sort all payments by date
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate if type is "all"
    if (type === "all") {
      payments = payments.slice(skip, skip + limit);
    }

    // Get total counts
    const totalOrders = await Order.countDocuments(
      paymentStatus ? { paymentStatus } : {},
    );
    const totalAppointments = await Appointment.countDocuments(
      paymentStatus ? { paymentStatus } : {},
    );

    let totalCount = 0;
    if (type === "all") {
      totalCount = totalOrders + totalAppointments;
    } else if (type === "order") {
      totalCount = totalOrders;
    } else {
      totalCount = totalAppointments;
    }

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payments list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments list",
      error: error.message,
    });
  }
};
