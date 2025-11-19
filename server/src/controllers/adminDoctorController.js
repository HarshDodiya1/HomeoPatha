const User = require("../models/User.js");
const Doctor = require("../models/Doctor.js");
const bcrypt = require("bcryptjs");

/**
 * @desc Create a new doctor (Admin only)
 * @route POST /api/admin/doctors
 * @access Private (Admin)
 */
const createDoctor = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const {
      fullName,
      email,
      password,
      phoneNumber,
      specialization,
      qualification,
      experience,
      consultationFee,
      about,
      images,
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, and phone number are required",
        code: "VALIDATION_ERROR",
      });
    }

    if (!specialization || !qualification || !experience || !consultationFee) {
      return res.status(400).json({
        success: false,
        message:
          "Specialization, qualification, experience, and consultation fee are required",
        code: "VALIDATION_ERROR",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        code: "EMAIL_EXISTS",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        code: "INVALID_PASSWORD",
      });
    }

    // Validate experience and fee
    if (experience < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a positive number",
        code: "INVALID_EXPERIENCE",
      });
    }

    if (consultationFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Consultation fee must be a positive number",
        code: "INVALID_CONSULTATION_FEE",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user account
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      role: "doctor",
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      userId: user._id,
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      experience: parseInt(experience),
      consultationFee: parseFloat(consultationFee),
      about: about ? about.trim() : "",
      images: images || [],
      rating: 0,
      totalRatings: 0,
    });

    // Populate user details in doctor
    const populatedDoctor = await Doctor.findById(doctor._id).populate(
      "userId",
      "fullName email phoneNumber role createdAt"
    );

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      code: "DOCTOR_CREATED",
      data: {
        doctor: populatedDoctor,
      },
    });
  } catch (error) {
    console.error("Create doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating doctor",
      code: "CREATE_DOCTOR_ERROR",
    });
  }
};

/**
 * @desc Update doctor by ID (Admin only)
 * @route PUT /api/admin/doctors/:id
 * @access Private (Admin)
 */
const updateDoctor = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id: doctorId } = req.params;
    const {
      fullName,
      email,
      phoneNumber,
      specialization,
      qualification,
      experience,
      consultationFee,
      about,
      images,
    } = req.body;

    // Validate doctor ID format
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
        code: "INVALID_DOCTOR_ID",
      });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
        code: "DOCTOR_NOT_FOUND",
      });
    }

    // Find user
    const user = await User.findById(doctor.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Update user fields if provided
    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }
    if (email !== undefined) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another user",
          code: "EMAIL_EXISTS",
        });
      }
      user.email = email.toLowerCase().trim();
    }
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber.replace(/\D/g, "");
    }

    // Save user updates
    await user.save();

    // Update doctor fields if provided
    if (specialization !== undefined) {
      doctor.specialization = specialization.trim();
    }
    if (qualification !== undefined) {
      doctor.qualification = qualification.trim();
    }
    if (experience !== undefined) {
      if (experience < 0) {
        return res.status(400).json({
          success: false,
          message: "Experience must be a positive number",
          code: "INVALID_EXPERIENCE",
        });
      }
      doctor.experience = parseInt(experience);
    }
    if (consultationFee !== undefined) {
      if (consultationFee < 0) {
        return res.status(400).json({
          success: false,
          message: "Consultation fee must be a positive number",
          code: "INVALID_CONSULTATION_FEE",
        });
      }
      doctor.consultationFee = parseFloat(consultationFee);
    }
    if (about !== undefined) {
      doctor.about = about.trim();
    }
    if (images !== undefined) {
      doctor.images = images;
    }

    // Save doctor updates
    await doctor.save();

    // Return updated doctor with user details
    const updatedDoctor = await Doctor.findById(doctorId).populate(
      "userId",
      "fullName email phoneNumber role createdAt"
    );

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      code: "DOCTOR_UPDATED",
      data: {
        doctor: updatedDoctor,
      },
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating doctor",
      code: "UPDATE_DOCTOR_ERROR",
    });
  }
};

/**
 * @desc Delete doctor by ID (Admin only)
 * @route DELETE /api/admin/doctors/:id
 * @access Private (Admin)
 */
const deleteDoctor = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id: doctorId } = req.params;

    // Validate doctor ID format
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
        code: "INVALID_DOCTOR_ID",
      });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
        code: "DOCTOR_NOT_FOUND",
      });
    }

    // Delete doctor profile
    await Doctor.findByIdAndDelete(doctorId);

    // Delete associated user account
    await User.findByIdAndDelete(doctor.userId);

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      code: "DOCTOR_DELETED",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting doctor",
      code: "DELETE_DOCTOR_ERROR",
    });
  }
};

module.exports = {
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
