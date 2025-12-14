const Appointment = require("../models/Appointment.js");
const Specialization = require("../models/Specialization.js");
const AppointmentQuestion = require("../models/AppointmentQuestion.js");
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

    const { specializationId, questionResponses } = req.body;

    // Validation
    if (!specializationId) {
      return res.status(400).json({
        success: false,
        message: "Specialization ID is required",
        code: "SPECIALIZATION_ID_REQUIRED",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(specializationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization ID format",
        code: "INVALID_SPECIALIZATION_ID",
      });
    }

    // Verify specialization exists and is active
    const specialization = await Specialization.findOne({
      _id: specializationId,
      isActive: true,
    });

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found or inactive",
        code: "SPECIALIZATION_NOT_FOUND",
      });
    }

    // Get consultation fee from specialization (NEVER from client)
    const consultationFee = specialization.consultationFee;

    // Validate question responses
    const requiredQuestions = await AppointmentQuestion.find({
      $or: [{ specializationId: specializationId }, { specializationId: null }],
      isActive: true,
      isRequired: true,
    }).lean();

    // Check if all required questions are answered
    const responseMap = {};
    if (questionResponses && Array.isArray(questionResponses)) {
      questionResponses.forEach((r) => {
        responseMap[r.questionId] = r;
      });
    }

    const missingQuestions = [];
    for (const q of requiredQuestions) {
      const response = responseMap[q._id.toString()];
      if (!response || !response.answer || (typeof response.answer === "string" && !response.answer.trim())) {
        missingQuestions.push(q.question);
      }
    }

    if (missingQuestions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please answer all required questions",
        code: "MISSING_REQUIRED_ANSWERS",
        data: { missingQuestions },
      });
    }

    // Format question responses with question text
    const formattedResponses = [];
    if (questionResponses && Array.isArray(questionResponses)) {
      for (const response of questionResponses) {
        const question = await AppointmentQuestion.findById(response.questionId);
        if (question) {
          formattedResponses.push({
            questionId: question._id,
            question: question.question,
            answer: response.answer,
          });
        }
      }
    }

    // Create appointment with pending status
    const newAppointment = new Appointment({
      patientId: req.user.id,
      specializationId,
      consultationFee,
      questionResponses: formattedResponses,
      status: "pending",
      paymentStatus: "pending",
    });

    await newAppointment.save();

    // Create Razorpay order
    const orderResult = await createOrder(
      consultationFee,
      newAppointment._id,
      req.user.email
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
        keyId: config.razorpay.keyId,
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
      .populate("specializationId", "name description consultationFee")
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
      .populate("specializationId", "name description consultationFee imageUrl tags")
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

/**
 * @desc    Get patient's appointments
 * @route   GET /api/appointments
 * @access  Patient
 */
const getPatientAppointments = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        code: "FORBIDDEN",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = { patientId: req.user.id };

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.paymentStatus) {
      filters.paymentStatus = req.query.paymentStatus;
    }

    const appointments = await Appointment.find(filters)
      .populate("specializationId", "name description consultationFee imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Appointment.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      code: "APPOINTMENTS_RETRIEVED",
      data: {
        appointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel appointment
 * @route   PUT /api/appointments/:id/cancel
 * @access  Patient
 */
const cancelAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment",
        code: "FORBIDDEN",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
        code: "ALREADY_CANCELLED",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed appointment",
        code: "CANNOT_CANCEL_COMPLETED",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = "patient";
    appointment.cancelReason = reason || "Cancelled by patient";
    await appointment.save();

    const populatedAppointment = await Appointment.findById(id)
      .populate("specializationId", "name")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      code: "APPOINTMENT_CANCELLED",
      data: {
        appointment: populatedAppointment,
      },
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointmentOrder,
  verifyAppointmentPayment,
  getAppointmentDetails,
  getPatientAppointments,
  cancelAppointment,
};
