const Appointment = require("../models/Appointment.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all appointments with pagination and filters
 * @route   GET /api/admin/appointments
 * @access  Admin
 */
const getAllAppointments = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1 and limit between 1-100.",
        code: "INVALID_PAGINATION",
      });
    }

    // Filters
    const filters = {};

    // Filter by status
    if (req.query.status) {
      filters.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      filters.paymentStatus = req.query.paymentStatus;
    }

    // Filter by doctor
    if (req.query.doctorId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID format",
          code: "INVALID_DOCTOR_ID",
        });
      }
      filters.doctorId = req.query.doctorId;
    }

    // Filter by patient
    if (req.query.patientId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID format",
          code: "INVALID_PATIENT_ID",
        });
      }
      filters.patientId = req.query.patientId;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filters.appointmentDate = {};
      if (req.query.startDate) {
        filters.appointmentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.appointmentDate.$lte = new Date(req.query.endDate);
      }
    }

    // Search by patient name or doctor
    if (req.query.search) {
      // We'll need to do a more complex query with populate
      const searchRegex = { $regex: req.query.search, $options: "i" };

      // First find matching patients and doctors
      const patients = await require("../models/User.js")
        .find({
          role: "patient",
          $or: [
            { fullName: searchRegex },
            { email: searchRegex },
            { phoneNumber: searchRegex },
          ],
        })
        .select("_id")
        .lean();

      const doctors = await require("../models/Doctor.js")
        .find()
        .populate({
          path: "userId",
          match: {
            $or: [
              { fullName: searchRegex },
              { email: searchRegex },
              { phoneNumber: searchRegex },
            ],
          },
        })
        .lean();

      const patientIds = patients.map((p) => p._id);
      const doctorIds = doctors
        .filter((d) => d.userId)
        .map((d) => d._id);

      if (patientIds.length > 0 || doctorIds.length > 0) {
        filters.$or = [];
        if (patientIds.length > 0) {
          filters.$or.push({ patientId: { $in: patientIds } });
        }
        if (doctorIds.length > 0) {
          filters.$or.push({ doctorId: { $in: doctorIds } });
        }
      }
    }

    // Sort options
    let sortOption = {};
    const sortBy = req.query.sortBy || "appointmentDate";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption[sortBy] = sortOrder;

    // Get appointments with filters
    const appointments = await Appointment.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("patientId", "fullName email phoneNumber")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "fullName email phoneNumber",
        },
      })
      .lean();

    // Get total count for pagination
    const totalAppointments = await Appointment.countDocuments(filters);
    const totalPages = Math.ceil(totalAppointments / limit);

    // Calculate statistics
    const stats = await Appointment.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          pendingAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          confirmedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$consultationFee",
                0,
              ],
            },
          },
          pendingPayments: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "pending"] },
                "$consultationFee",
                0,
              ],
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      code: "APPOINTMENTS_RETRIEVED",
      data: {
        appointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalAppointments,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: stats[0] || {
          totalAppointments: 0,
          pendingAppointments: 0,
          confirmedAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          totalRevenue: 0,
          pendingPayments: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific appointment by ID
 * @route   GET /api/admin/appointments/:id
 * @access  Admin
 */
const getAppointmentById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Find appointment with full details
    const appointment = await Appointment.findById(id)
      .populate("patientId", "fullName email phoneNumber addresses")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "fullName email phoneNumber",
        },
      })
      .lean();

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
    console.error("Error fetching appointment details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve appointment details",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Update appointment details
 * @route   PUT /api/admin/appointments/:id
 * @access  Admin
 */
const updateAppointment = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;
    const {
      appointmentDate,
      appointmentTime,
      duration,
      reason,
      status,
      consultationFee,
      paymentStatus,
      notes,
      prescription,
    } = req.body;

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    // Validate status if provided
    if (status && !["pending", "confirmed", "completed", "cancelled", "rescheduled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        code: "INVALID_STATUS",
      });
    }

    // Validate payment status if provided
    if (paymentStatus && !["pending", "completed", "failed", "refunded"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status value",
        code: "INVALID_PAYMENT_STATUS",
      });
    }

    // Validate consultation fee if provided
    if (consultationFee !== undefined && consultationFee <= 0) {
      return res.status(400).json({
        success: false,
        message: "Consultation fee must be greater than 0",
        code: "INVALID_CONSULTATION_FEE",
      });
    }

    // If rescheduling (date or time changed), check for conflicts
    if (appointmentDate || appointmentTime) {
      const newDate = appointmentDate ? new Date(appointmentDate) : appointment.appointmentDate;
      const newTime = appointmentTime || appointment.appointmentTime;

      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: id },
        doctorId: appointment.doctorId,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: { $in: ["pending", "confirmed"] },
      });

      if (conflictingAppointment) {
        return res.status(409).json({
          success: false,
          message: "This time slot is already booked",
          code: "TIME_SLOT_UNAVAILABLE",
        });
      }
    }

    // Update fields
    if (appointmentDate !== undefined) {
      appointment.appointmentDate = new Date(appointmentDate);
    }
    if (appointmentTime !== undefined) appointment.appointmentTime = appointmentTime;
    if (duration !== undefined) appointment.duration = duration;
    if (reason !== undefined) appointment.reason = reason.trim();
    if (status !== undefined) appointment.status = status;
    if (consultationFee !== undefined) appointment.consultationFee = consultationFee;
    if (paymentStatus !== undefined) appointment.paymentStatus = paymentStatus;
    if (notes !== undefined) appointment.notes = notes?.trim() || undefined;
    if (prescription !== undefined) appointment.prescription = prescription?.trim() || undefined;

    await appointment.save();

    // Populate and return updated appointment
    const updatedAppointment = await Appointment.findById(id)
      .populate("patientId", "fullName email phoneNumber")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "fullName email phoneNumber",
        },
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      code: "APPOINTMENT_UPDATED",
      data: {
        appointment: updatedAppointment,
      },
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PUT /api/admin/appointments/:id/status
 * @access  Admin
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;
    const { status, cancelReason } = req.body;

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Validate status
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
        code: "STATUS_REQUIRED",
      });
    }

    if (!["pending", "confirmed", "completed", "cancelled", "rescheduled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be one of: pending, confirmed, completed, cancelled, rescheduled",
        code: "INVALID_STATUS",
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    // Update status
    appointment.status = status;

    // If cancelling, add cancellation details
    if (status === "cancelled") {
      appointment.cancelledBy = "admin";
      if (cancelReason) {
        appointment.cancelReason = cancelReason.trim();
      }
    }

    await appointment.save();

    // Populate and return updated appointment
    const updatedAppointment = await Appointment.findById(id)
      .populate("patientId", "fullName email phoneNumber")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "fullName email phoneNumber",
        },
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      code: "APPOINTMENT_STATUS_UPDATED",
      data: {
        appointment: updatedAppointment,
      },
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete/cancel appointment
 * @route   DELETE /api/admin/appointments/:id
 * @access  Admin
 */
const deleteAppointment = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Find and delete appointment
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      code: "APPOINTMENT_DELETED",
      data: {
        deletedAppointment: {
          id: appointment._id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentDate: appointment.appointmentDate,
          status: appointment.status,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};
