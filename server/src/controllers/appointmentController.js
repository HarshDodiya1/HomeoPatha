const Appointment = require("../models/Appointment.js");
const Doctor = require("../models/Doctor.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");

/**
 * @desc    Book new appointment
 * @route   POST /api/appointments
 * @access  Patient
 */
const bookAppointment = async (req, res) => {
  try {
    // Check if user is patient
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can book appointments",
        code: "FORBIDDEN",
      });
    }

    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      duration,
      reason,
      consultationFee,
      notes,
    } = req.body;

    // Validation
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
        code: "DOCTOR_ID_REQUIRED",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
        code: "INVALID_DOCTOR_ID",
      });
    }

    if (!appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Appointment date is required",
        code: "APPOINTMENT_DATE_REQUIRED",
      });
    }

    if (!appointmentTime) {
      return res.status(400).json({
        success: false,
        message: "Appointment time is required",
        code: "APPOINTMENT_TIME_REQUIRED",
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason for appointment is required",
        code: "REASON_REQUIRED",
      });
    }

    if (!consultationFee || consultationFee <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid consultation fee is required",
        code: "INVALID_CONSULTATION_FEE",
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId).populate("userId");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
        code: "DOCTOR_NOT_FOUND",
      });
    }

    // Check if doctor is available
    if (!doctor.userId?.isActive) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available for appointments",
        code: "DOCTOR_NOT_AVAILABLE",
      });
    }

    // Validate appointment date is not in the past
    const appointmentDateTime = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDateTime < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past",
        code: "INVALID_DATE",
      });
    }

    // Check for conflicting appointments for the same doctor
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
        code: "TIME_SLOT_UNAVAILABLE",
      });
    }

    // Create appointment
    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      duration: duration || 30,
      reason: reason.trim(),
      consultationFee,
      notes: notes?.trim() || undefined,
      status: "pending",
      paymentStatus: "pending",
    });

    await newAppointment.save();

    // Populate the appointment details
    const populatedAppointment = await Appointment.findById(
      newAppointment._id,
    )
      .populate("patientId", "fullName email phoneNumber")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "fullName email phoneNumber",
        },
      })
      .lean();

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      code: "APPOINTMENT_BOOKED",
      data: {
        appointment: populatedAppointment,
      },
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get appointment details
 * @route   GET /api/appointments/:id
 * @access  Patient, Admin
 */
const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Find appointment
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

    // Check authorization - patient can only see their own appointments, admin can see all
    if (
      req.user.role === "patient" &&
      appointment.patientId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this appointment",
        code: "FORBIDDEN",
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

module.exports = {
  bookAppointment,
  getAppointmentDetails,
};
