const User = require("../models/User.js");
const Doctor = require("../models/Doctor.js");
const Appointment = require("../models/Appointment.js");
const {
  validateUpdateDoctorProfile,
  validateUpdateAppointmentStatus,
} = require("../validators/doctorValidator.js");

/**
 * @desc Get all doctors with filters and pagination
 * @route GET /api/doctors
 * @access Public
 * @query page (default: 1), limit (default: 10), specialization, minRating
 */
const getAllDoctors = async (req, res) => {
  try {
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

    // Build filter object
    const filter = {};
    if (req.query.specialization) {
      filter.specialization = new RegExp(req.query.specialization, "i");
    }
    if (req.query.minRating) {
      const minRating = parseFloat(req.query.minRating);
      if (!isNaN(minRating)) {
        filter.rating = { $gte: minRating };
      }
    }

    // Get total count
    const totalDoctors = await Doctor.countDocuments(filter);

    // Get doctors with pagination
    const doctors = await Doctor.find(filter)
      .sort({ rating: -1, totalRatings: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email phoneNumber");

    // Calculate total pages
    const totalPages = Math.ceil(totalDoctors / limit);

    return res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      code: "DOCTORS_RETRIEVED",
      data: {
        doctors,
        pagination: {
          currentPage: page,
          totalPages,
          totalDoctors,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get all doctors error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving doctors",
      code: "DOCTORS_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Get specific doctor details
 * @route GET /api/doctors/:id
 * @access Public
 */
const getDoctorDetails = async (req, res) => {
  try {
    const { id: doctorId } = req.params;

    // Validate doctor ID format
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
        code: "INVALID_DOCTOR_ID",
      });
    }

    // Find doctor with user details
    const doctor = await Doctor.findById(doctorId).populate(
      "userId",
      "fullName email phoneNumber addresses",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
        code: "DOCTOR_NOT_FOUND",
      });
    }

    // Get appointment count
    const appointmentCount = await Appointment.countDocuments({
      doctorId,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor details retrieved successfully",
      code: "DOCTOR_DETAILS_RETRIEVED",
      data: {
        doctor: {
          id: doctor._id,
          userId: doctor.userId,
          specialization: doctor.specialization,
          qualification: doctor.qualification,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          about: doctor.about,
          rating: doctor.rating,
          totalRatings: doctor.totalRatings,
          totalAppointments: appointmentCount,
          createdAt: doctor.createdAt,
          updatedAt: doctor.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get doctor details error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving doctor details",
      code: "DOCTOR_DETAILS_ERROR",
    });
  }
};

/**
 * @desc Update doctor profile
 * @route PUT /api/doctors/profile
 * @access Private (Doctor)
 */
const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      phoneNumber,
      specialization,
      qualification,
      experience,
      consultationFee,
      about,
    } = req.body;

    // Input validation
    const validation = validateUpdateDoctorProfile(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.errors,
      });
    }

    // Find doctor by userId
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
        code: "DOCTOR_PROFILE_NOT_FOUND",
      });
    }

    // Find and update user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Update user fields
    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber.replace(/\D/g, "");
    }
    await user.save();

    // Update doctor fields
    if (specialization !== undefined) {
      doctor.specialization = specialization.trim();
    }
    if (qualification !== undefined) {
      doctor.qualification = qualification.trim();
    }
    if (experience !== undefined) {
      doctor.experience = experience;
    }
    if (consultationFee !== undefined) {
      doctor.consultationFee = consultationFee;
    }
    if (about !== undefined) {
      doctor.about = about.trim();
    }

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      code: "DOCTOR_PROFILE_UPDATED",
      data: {
        doctor: {
          id: doctor._id,
          userId: doctor.userId,
          specialization: doctor.specialization,
          qualification: doctor.qualification,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          about: doctor.about,
          rating: doctor.rating,
          totalRatings: doctor.totalRatings,
          updatedAt: doctor.updatedAt,
        },
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      },
    });
  } catch (error) {
    console.error("Update doctor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating doctor profile",
      code: "DOCTOR_PROFILE_UPDATE_ERROR",
    });
  }
};

/**
 * @desc Get doctor's appointments with pagination
 * @route GET /api/doctors/appointments
 * @access Private (Doctor)
 * @query page (default: 1), limit (default: 10), status
 */
const getDoctorAppointments = async (req, res) => {
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

    // Find doctor by userId
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
        code: "DOCTOR_PROFILE_NOT_FOUND",
      });
    }

    // Build filter
    const filter = { doctorId: doctor._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get total count
    const totalAppointments = await Appointment.countDocuments(filter);

    // Get appointments with pagination
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("patientId", "fullName email phoneNumber");

    // Calculate total pages
    const totalPages = Math.ceil(totalAppointments / limit);

    return res.status(200).json({
      success: true,
      message: "Doctor appointments retrieved successfully",
      code: "DOCTOR_APPOINTMENTS_RETRIEVED",
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
    console.error("Get doctor appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving appointments",
      code: "DOCTOR_APPOINTMENTS_ERROR",
    });
  }
};

/**
 * @desc Update appointment status and notes
 * @route PUT /api/doctors/appointments/:id
 * @access Private (Doctor)
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: appointmentId } = req.params;
    const { status, notes, prescription } = req.body;

    // Validate appointment ID format
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format",
        code: "INVALID_APPOINTMENT_ID",
      });
    }

    // Input validation
    const validation = validateUpdateAppointmentStatus(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.errors,
      });
    }

    // Find doctor by userId
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
        code: "DOCTOR_PROFILE_NOT_FOUND",
      });
    }

    // Find appointment and verify it belongs to the doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    }).populate("patientId", "fullName email phoneNumber");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    // Update appointment fields
    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes.trim();
    }
    if (prescription !== undefined) {
      appointment.prescription = prescription.trim();
    }

    // If status is completed, set the current timestamp
    if (status === "completed" && !appointment.completedAt) {
      appointment.completedAt = new Date();
    }

    // If status is cancelled, set cancelled details
    if (status === "cancelled") {
      appointment.cancelledBy = "doctor";
    }

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      code: "APPOINTMENT_UPDATED",
      data: {
        appointment,
      },
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating appointment",
      code: "APPOINTMENT_UPDATE_ERROR",
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorDetails,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
};
