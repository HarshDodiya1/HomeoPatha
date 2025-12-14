const User = require("../models/User.js");
const Order = require("../models/Order.js");
const Appointment = require("../models/Appointment.js");
const Doctor = require("../models/Doctor.js");
const { validateUpdateUserProfile } = require("../validators/userValidator.js");

/**
 * @desc Get user profile with all details
 * @route GET /api/users/profile
 * @access Private (Patient)
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user by ID and exclude password
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
        code: "PROFILE_NOT_FOUND",
      });
    }

    // Get user's order count and appointment count
    const orderCount = await Order.countDocuments({ userId });
    const appointmentCount = await Appointment.countDocuments({
      patientId: userId,
    });

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      code: "PROFILE_RETRIEVED",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          addresses: user.addresses,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        stats: {
          totalOrders: orderCount,
          totalAppointments: appointmentCount,
        },
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving user profile",
      code: "PROFILE_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Update user profile (fullName, phoneNumber, addresses)
 * @route PUT /api/users/profile
 * @access Private (Patient)
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, addresses } = req.body;

    // Input validation
    const validation = validateUpdateUserProfile(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.errors,
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Update allowed fields
    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber.replace(/\D/g, "");
    }

    if (addresses !== undefined && Array.isArray(addresses)) {
      user.addresses = addresses.map((addr) => ({
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || "",
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: addr.isDefault || false,
      }));
    }

    // Save updated user
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      code: "PROFILE_UPDATED",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          addresses: user.addresses,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating profile",
      code: "PROFILE_UPDATE_ERROR",
    });
  }
};

/**
 * @desc Get all user orders with pagination
 * @route GET /api/users/orders
 * @access Private (Patient)
 * @query page (default: 1), limit (default: 10)
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination params
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        code: "INVALID_PAGINATION",
      });
    }

    // Get total count
    const totalOrders = await Order.countDocuments({ userId });

    // Get orders with pagination
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("orderItems.productId", "name image");

    // Calculate total pages
    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
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
    console.error("Get user orders error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving orders",
      code: "ORDERS_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Get specific order details
 * @route GET /api/users/orders/:id
 * @access Private (Patient)
 */
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: orderId } = req.params;

    // Validate order ID format
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
        code: "INVALID_ORDER_ID",
      });
    }

    // Find order and verify it belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      userId,
    }).populate("orderItems.productId");

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
      data: {
        order,
      },
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
 * @desc Get all user appointments with pagination
 * @route GET /api/users/appointments
 * @access Private (Patient)
 * @query page (default: 1), limit (default: 10)
 */
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination params
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        code: "INVALID_PAGINATION",
      });
    }

    // Get total count
    const totalAppointments = await Appointment.countDocuments({
      patientId: userId,
    });

    // Get appointments with pagination and specialization details
    const appointments = await Appointment.find({ patientId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "specializationId",
        select: "name description consultationFee imageUrl tags"
      });

    // Calculate total pages
    const totalPages = Math.ceil(totalAppointments / limit);

    return res.status(200).json({
      success: true,
      message: "User appointments retrieved successfully",
      code: "APPOINTMENTS_RETRIEVED",
      data: {
        appointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalAppointments,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get user appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving appointments",
      code: "APPOINTMENTS_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Get specific appointment details
 * @route GET /api/users/appointments/:id
 * @access Private (Patient)
 */
const getAppointmentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: appointmentId } = req.params;

    // Validate appointment ID format
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Find appointment and verify it belongs to the user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: userId,
    }).populate({
      path: "specializationId",
      select: "name description consultationFee imageUrl tags"
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment details retrieved successfully",
      code: "APPOINTMENT_DETAILS_RETRIEVED",
      data: {
        appointment,
      },
    });
  } catch (error) {
    console.error("Get appointment details error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving appointment details",
      code: "APPOINTMENT_DETAILS_ERROR",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getOrderDetails,
  getUserAppointments,
  getAppointmentDetails,
};
