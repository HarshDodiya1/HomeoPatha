const Order = require("../models/Order.js");
const Appointment = require("../models/Appointment.js");
const Product = require("../models/Product.js");
const User = require("../models/User.js");
const Doctor = require("../models/Doctor.js");

/**
 * @desc Get dashboard overview statistics
 * @route GET /api/admin/analytics/dashboard-stats
 * @access Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get current date and date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Appointments
    const totalAppointments = await Appointment.countDocuments();
    const appointmentsThisMonth = await Appointment.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const appointmentsLastMonth = await Appointment.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const appointmentsGrowth =
      appointmentsLastMonth === 0
        ? 100
        : (
            ((appointmentsThisMonth - appointmentsLastMonth) /
              appointmentsLastMonth) *
            100
          ).toFixed(1);

    // Total Patients
    const totalPatients = await User.countDocuments({ role: "patient" });
    const patientsThisMonth = await User.countDocuments({
      role: "patient",
      createdAt: { $gte: startOfMonth },
    });
    const patientsLastMonth = await User.countDocuments({
      role: "patient",
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const patientsGrowth =
      patientsLastMonth === 0
        ? 100
        : (
            ((patientsThisMonth - patientsLastMonth) / patientsLastMonth) *
            100
          ).toFixed(1);

    // Total Products Sold
    const ordersWithProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$orderItems" },
      { $group: { _id: null, totalSold: { $sum: "$orderItems.quantity" } } },
    ]);
    const totalProductsSold = ordersWithProducts[0]?.totalSold || 0;

    const ordersThisMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $unwind: "$orderItems" },
      { $group: { _id: null, totalSold: { $sum: "$orderItems.quantity" } } },
    ]);
    const productsSoldThisMonth = ordersThisMonth[0]?.totalSold || 0;

    const ordersLastMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $unwind: "$orderItems" },
      { $group: { _id: null, totalSold: { $sum: "$orderItems.quantity" } } },
    ]);
    const productsSoldLastMonth = ordersLastMonth[0]?.totalSold || 0;

    const productsSoldGrowth =
      productsSoldLastMonth === 0
        ? 100
        : (
            ((productsSoldThisMonth - productsSoldLastMonth) /
              productsSoldLastMonth) *
            100
          ).toFixed(1);

    // Total Revenue (from orders + appointments)
    const orderRevenue = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const appointmentRevenue = await Appointment.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$consultationFee" } } },
    ]);
    const totalRevenue =
      (orderRevenue[0]?.total || 0) + (appointmentRevenue[0]?.total || 0);

    const orderRevenueThisMonth = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const appointmentRevenueThisMonth = await Appointment.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$consultationFee" } } },
    ]);
    const revenueThisMonth =
      (orderRevenueThisMonth[0]?.total || 0) +
      (appointmentRevenueThisMonth[0]?.total || 0);

    const orderRevenueLastMonth = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const appointmentRevenueLastMonth = await Appointment.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$consultationFee" } } },
    ]);
    const revenueLastMonth =
      (orderRevenueLastMonth[0]?.total || 0) +
      (appointmentRevenueLastMonth[0]?.total || 0);

    const revenueGrowth =
      revenueLastMonth === 0
        ? 100
        : (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(
            1,
          );

    // Total Doctors
    const totalDoctors = await Doctor.countDocuments();

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Pending Appointments
    const pendingAppointments = await Appointment.countDocuments({
      status: "pending",
    });

    // Confirmed Appointments
    const confirmedAppointments = await Appointment.countDocuments({
      status: "confirmed",
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard stats retrieved successfully",
      code: "STATS_RETRIEVED",
      data: {
        appointments: {
          total: totalAppointments,
          thisMonth: appointmentsThisMonth,
          growth: parseFloat(appointmentsGrowth),
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
        },
        patients: {
          total: totalPatients,
          thisMonth: patientsThisMonth,
          growth: parseFloat(patientsGrowth),
        },
        productsSold: {
          total: totalProductsSold,
          thisMonth: productsSoldThisMonth,
          growth: parseFloat(productsSoldGrowth),
        },
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth,
          growth: parseFloat(revenueGrowth),
          fromOrders: orderRevenue[0]?.total || 0,
          fromAppointments: appointmentRevenue[0]?.total || 0,
        },
        doctors: {
          total: totalDoctors,
        },
        orders: {
          total: totalOrders,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching dashboard stats",
      code: "STATS_ERROR",
    });
  }
};

/**
 * @desc Get revenue analytics over time
 * @route GET /api/admin/analytics/revenue
 * @access Admin
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "month" } = req.query; // 'week', 'month', 'year'

    let groupBy;
    let dateRange;
    const now = new Date();

    if (period === "week") {
      // Last 7 days
      dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === "year") {
      // Last 12 months
      dateRange = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    } else {
      // Last 30 days (default)
      dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    // Revenue from Orders
    const orderRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: dateRange },
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue from Appointments
    const appointmentRevenue = await Appointment.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: dateRange },
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$consultationFee" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Combine both revenues
    const revenueMap = new Map();

    orderRevenue.forEach((item) => {
      revenueMap.set(item._id, {
        date: item._id,
        ordersRevenue: item.revenue,
        ordersCount: item.count,
        appointmentsRevenue: 0,
        appointmentsCount: 0,
      });
    });

    appointmentRevenue.forEach((item) => {
      if (revenueMap.has(item._id)) {
        const existing = revenueMap.get(item._id);
        existing.appointmentsRevenue = item.revenue;
        existing.appointmentsCount = item.count;
      } else {
        revenueMap.set(item._id, {
          date: item._id,
          ordersRevenue: 0,
          ordersCount: 0,
          appointmentsRevenue: item.revenue,
          appointmentsCount: item.count,
        });
      }
    });

    const revenueData = Array.from(revenueMap.values()).map((item) => ({
      ...item,
      totalRevenue: item.ordersRevenue + item.appointmentsRevenue,
    }));

    return res.status(200).json({
      success: true,
      message: "Revenue analytics retrieved successfully",
      code: "REVENUE_ANALYTICS_RETRIEVED",
      data: {
        period,
        revenueData,
      },
    });
  } catch (error) {
    console.error("Get revenue analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching revenue analytics",
      code: "REVENUE_ANALYTICS_ERROR",
    });
  }
};

/**
 * @desc Get orders analytics
 * @route GET /api/admin/analytics/orders
 * @access Admin
 */
const getOrdersAnalytics = async (req, res) => {
  try {
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Payment status breakdown
    const paymentStatus = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Payment method breakdown
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          title: { $first: "$orderItems.title" },
          totalQuantity: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email")
      .select(
        "orderItems totalAmount orderStatus paymentStatus paymentMethod createdAt",
      );

    return res.status(200).json({
      success: true,
      message: "Orders analytics retrieved successfully",
      code: "ORDERS_ANALYTICS_RETRIEVED",
      data: {
        ordersByStatus,
        paymentStatus,
        paymentMethods,
        topProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Get orders analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders analytics",
      code: "ORDERS_ANALYTICS_ERROR",
    });
  }
};

/**
 * @desc Get appointments analytics
 * @route GET /api/admin/analytics/appointments
 * @access Admin
 */
const getAppointmentsAnalytics = async (req, res) => {
  try {
    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Appointments by payment status
    const appointmentsByPaymentStatus = await Appointment.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$consultationFee" },
        },
      },
    ]);

    // Top doctors by appointments
    const topDoctors = await Appointment.aggregate([
      {
        $group: {
          _id: "$doctorId",
          totalAppointments: { $sum: 1 },
          totalRevenue: { $sum: "$consultationFee" },
        },
      },
      { $sort: { totalAppointments: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      { $unwind: "$doctorInfo" },
      {
        $lookup: {
          from: "users",
          localField: "doctorInfo.userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          doctorName: "$userInfo.fullName",
          specialization: "$doctorInfo.specialization",
          totalAppointments: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Appointments over time (last 30 days)
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    );
    const appointmentsOverTime = await Appointment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patientId", "fullName email")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "fullName" },
      })
      .select(
        "appointmentDate appointmentTime status paymentStatus consultationFee reason",
      );

    return res.status(200).json({
      success: true,
      message: "Appointments analytics retrieved successfully",
      code: "APPOINTMENTS_ANALYTICS_RETRIEVED",
      data: {
        appointmentsByStatus,
        appointmentsByPaymentStatus,
        topDoctors,
        appointmentsOverTime,
        recentAppointments,
      },
    });
  } catch (error) {
    console.error("Get appointments analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching appointments analytics",
      code: "APPOINTMENTS_ANALYTICS_ERROR",
    });
  }
};

/**
 * @desc Get products analytics
 * @route GET /api/admin/analytics/products
 * @access Admin
 */
const getProductsAnalytics = async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });

    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Low stock products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select("title stock category currentPrice")
      .sort({ stock: 1 })
      .limit(10);

    // Out of stock products
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // Average product price
    const avgPrice = await Product.aggregate([
      {
        $group: {
          _id: null,
          averagePrice: { $avg: "$currentPrice" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Products analytics retrieved successfully",
      code: "PRODUCTS_ANALYTICS_RETRIEVED",
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        outOfStockProducts,
        productsByCategory,
        lowStockProducts,
        averagePrice: avgPrice[0]?.averagePrice || 0,
      },
    });
  } catch (error) {
    console.error("Get products analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching products analytics",
      code: "PRODUCTS_ANALYTICS_ERROR",
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueAnalytics,
  getOrdersAnalytics,
  getAppointmentsAnalytics,
  getProductsAnalytics,
};
