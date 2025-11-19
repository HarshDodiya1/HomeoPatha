const Appointment = require("../models/Appointment.js");
const Doctor = require("../models/Doctor.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");
const {
  createOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
} = require("../services/razorpayService.js");
const config = require("../config/config.js");

/**
 * @desc    Create Razorpay order for appointment
 * @route   POST /api/appointments/create-order
 * @access  Patient
 */
const createAppointmentOrder = async (req, res) => {
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

    // Verify doctor exists and get consultation fee from server
    const doctor = await Doctor.findById(doctorId).populate("userId");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
        code: "DOCTOR_NOT_FOUND",
      });
    }

    // Get consultation fee from doctor's profile (NEVER from client)
    const consultationFee = doctor.consultationFee || 500;

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

    // Create appointment with pending status
    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      appointmentDate: appointmentDateTime,
      appointmentTime,
      duration: duration || 30,
      reason: reason.trim(),
      consultationFee, // Server-side fee, not from client
      notes: notes?.trim() || undefined,
      status: "pending",
      paymentStatus: "pending",
    });

    await newAppointment.save();

    // Create Razorpay order
    const orderResult = await createOrder(
      consultationFee,
      newAppointment._id,
      req.user.email,
    );

    if (!orderResult.success) {
      // Delete the appointment if order creation fails
      await Appointment.findByIdAndDelete(newAppointment._id);

      return res.status(500).json({
        success: false,
        message: "Failed to create payment order",
        code: "ORDER_CREATION_FAILED",
        error: orderResult.error,
      });
    }

    // Store Razorpay order ID
    newAppointment.paymentDetails = {
      razorpayOrderId: orderResult.order.id,
    };
    await newAppointment.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      code: "ORDER_CREATED",
      data: {
        appointmentId: newAppointment._id,
        orderId: orderResult.order.id,
        amount: consultationFee,
        currency: orderResult.order.currency,
        keyId: config.razorpay.keyId, // Send only key ID, never secret
      },
    });
  } catch (error) {
    console.error("Error creating appointment order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create appointment order",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Verify payment and confirm appointment
 * @route   POST /api/appointments/verify-payment
 * @access  Patient
 */
const verifyAppointmentPayment = async (req, res) => {
  try {
    // Check if user is patient
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can verify payments",
        code: "FORBIDDEN",
      });
    }

    const {
      appointmentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // Validation
    if (
      !appointmentId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        success: false,
        message: "All payment details are required",
        code: "MISSING_PAYMENT_DETAILS",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    // Verify appointment belongs to the user
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this payment",
        code: "FORBIDDEN",
      });
    }

    // Check if appointment is already paid
    if (appointment.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "This appointment has already been paid",
        code: "ALREADY_PAID",
      });
    }

    // Verify Razorpay signature
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!isValid) {
      // Mark payment as failed
      appointment.paymentStatus = "failed";
      await appointment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature",
        code: "INVALID_SIGNATURE",
      });
    }

    // Fetch payment details from Razorpay for additional verification
    const paymentResult = await fetchPaymentDetails(razorpayPaymentId);

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment details",
        code: "PAYMENT_FETCH_FAILED",
      });
    }

    const payment = paymentResult.payment;

    // Verify payment amount matches appointment fee
    const amountPaid = payment.amount / 100; // Convert from paise to rupees
    if (amountPaid !== appointment.consultationFee) {
      appointment.paymentStatus = "failed";
      await appointment.save();

      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
        code: "AMOUNT_MISMATCH",
      });
    }

    // Verify payment status
    if (payment.status !== "captured" && payment.status !== "authorized") {
      appointment.paymentStatus = "failed";
      await appointment.save();

      return res.status(400).json({
        success: false,
        message: "Payment not successful",
        code: "PAYMENT_NOT_SUCCESSFUL",
      });
    }

    // Update appointment with payment details
    appointment.paymentStatus = "completed";
    appointment.status = "confirmed";
    appointment.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };

    await appointment.save();

    // Populate appointment details for response
    const populatedAppointment = await Appointment.findById(appointment._id)
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
      message: "Payment verified and appointment confirmed successfully",
      code: "PAYMENT_VERIFIED",
      data: {
        appointment: populatedAppointment,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
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
  createAppointmentOrder,
  verifyAppointmentPayment,
  getAppointmentDetails,
};
