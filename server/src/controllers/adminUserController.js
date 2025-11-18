const User = require("../models/User.js");
const Order = require("../models/Order.js");
const Appointment = require("../models/Appointment.js");
const Doctor = require("../models/Doctor.js");

/**
 * @desc Get all patients (Admin only)
 * @route GET /api/admin/users
 * @access Private (Admin)
 * @query page (default: 1), limit (default: 10), search
 */
const getAllPatients = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Validate pagination params
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        code: "INVALID_PAGINATION",
      });
    }

    // Build filter object - only get patients (role: patient)
    const filter = { role: "patient" };
    
    // Add search filter if provided
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phoneNumber: new RegExp(search, "i") },
      ];
    }

    // Get total count
    const totalPatients = await User.countDocuments(filter);

    // Get patients with pagination
    const patients = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get stats for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const orderCount = await Order.countDocuments({ userId: patient._id });
        const appointmentCount = await Appointment.countDocuments({
          patientId: patient._id,
        });

        return {
          id: patient._id,
          fullName: patient.fullName,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          role: patient.role,
          addresses: patient.addresses,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
          stats: {
            totalOrders: orderCount,
            totalAppointments: appointmentCount,
          },
        };
      })
    );

    // Calculate total pages
    const totalPages = Math.ceil(totalPatients / limit);

    return res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      code: "PATIENTS_RETRIEVED",
      data: {
        patients: patientsWithStats,
        pagination: {
          currentPage: page,
          totalPages,
          totalPatients,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get all patients error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving patients",
      code: "PATIENTS_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Get specific patient details (Admin only)
 * @route GET /api/admin/users/:id
 * @access Private (Admin)
 */
const getPatientDetails = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id: patientId } = req.params;

    // Validate patient ID format
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
        code: "INVALID_PATIENT_ID",
      });
    }

    // Find patient
    const patient = await User.findById(patientId).select("-password");
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
        code: "PATIENT_NOT_FOUND",
      });
    }

    // Only allow access to patient role users
    if (patient.role !== "patient") {
      return res.status(400).json({
        success: false,
        message: "User is not a patient",
        code: "NOT_A_PATIENT",
      });
    }

    // Get patient statistics
    const orderCount = await Order.countDocuments({ userId: patientId });
    const appointmentCount = await Appointment.countDocuments({
      patientId: patientId,
    });

    // Get recent orders (last 5)
    const recentOrders = await Order.find({ userId: patientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id orderStatus totalAmount createdAt");

    // Get recent appointments (last 5)
    const recentAppointments = await Appointment.find({ patientId: patientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("doctorId", "specialization qualification")
      .select("_id status appointmentDate appointmentTime reason");

    return res.status(200).json({
      success: true,
      message: "Patient details retrieved successfully",
      code: "PATIENT_DETAILS_RETRIEVED",
      data: {
        patient: {
          id: patient._id,
          fullName: patient.fullName,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          role: patient.role,
          addresses: patient.addresses,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        },
        stats: {
          totalOrders: orderCount,
          totalAppointments: appointmentCount,
        },
        recentOrders,
        recentAppointments,
      },
    });
  } catch (error) {
    console.error("Get patient details error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving patient details",
      code: "PATIENT_DETAILS_ERROR",
    });
  }
};

/**
 * @desc Update patient details (Admin only)
 * @route PUT /api/admin/users/:id
 * @access Private (Admin)
 */
const updatePatient = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id: patientId } = req.params;
    const { fullName, email, phoneNumber, addresses } = req.body;

    // Validate patient ID format
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
        code: "INVALID_PATIENT_ID",
      });
    }

    // Find patient
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
        code: "PATIENT_NOT_FOUND",
      });
    }

    // Only allow updating patient role users
    if (patient.role !== "patient") {
      return res.status(400).json({
        success: false,
        message: "User is not a patient",
        code: "NOT_A_PATIENT",
      });
    }

    // Update fields if provided
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty",
          code: "INVALID_FULL_NAME",
        });
      }
      patient.fullName = fullName.trim();
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
          code: "INVALID_EMAIL",
        });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT",
        });
      }

      // Check if email is already taken by another user
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: patientId },
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another user",
          code: "EMAIL_EXISTS",
        });
      }
      patient.email = email.toLowerCase().trim();
    }

    if (phoneNumber !== undefined) {
      if (!phoneNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty",
          code: "INVALID_PHONE_NUMBER",
        });
      }
      patient.phoneNumber = phoneNumber.replace(/\D/g, "");
    }

    if (addresses !== undefined && Array.isArray(addresses)) {
      patient.addresses = addresses.map((addr) => ({
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || "",
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: addr.isDefault || false,
      }));
    }

    // Save updates
    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      code: "PATIENT_UPDATED",
      data: {
        patient: {
          id: patient._id,
          fullName: patient.fullName,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          role: patient.role,
          addresses: patient.addresses,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update patient error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating patient",
      code: "UPDATE_PATIENT_ERROR",
    });
  }
};

/**
 * @desc Delete patient (Admin only)
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin)
 */
const deletePatient = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id: patientId } = req.params;

    // Validate patient ID format
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
        code: "INVALID_PATIENT_ID",
      });
    }

    // Find patient
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
        code: "PATIENT_NOT_FOUND",
      });
    }

    // Only allow deleting patient role users
    if (patient.role !== "patient") {
      return res.status(400).json({
        success: false,
        message: "User is not a patient",
        code: "NOT_A_PATIENT",
      });
    }

    // Delete patient
    await User.findByIdAndDelete(patientId);

    // Note: You might want to handle related data (orders, appointments) differently
    // For now, we're just deleting the user record
    // Consider soft delete or archiving related data

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      code: "PATIENT_DELETED",
    });
  } catch (error) {
    console.error("Delete patient error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting patient",
      code: "DELETE_PATIENT_ERROR",
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientDetails,
  updatePatient,
  deletePatient,
};
