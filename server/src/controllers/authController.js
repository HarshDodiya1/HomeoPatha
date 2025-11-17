const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const {
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
} = require("../validators/authValidator.js");

/**
 * @desc Register a new user (patient)
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phoneNumber, role } =
      req.body;

    // Input validation
    const validation = validateRegistration(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.errors,
      });
    }

    // Convert email to lowercase for consistency
    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please use a different email.",
        code: "USER_EXISTS",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
        code: "PASSWORD_MISMATCH",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName: fullName.trim(),
      email: emailLower,
      password: hashedPassword,
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      role: role || "patient",
    });

    // Save user to database
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      code: "REGISTRATION_SUCCESS",
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      code: "REGISTRATION_ERROR",
    });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.errors,
      });
    }

    // Convert email to lowercase
    const emailLower = email.toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email",
        code: "INVALID_EMAIL",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
        code: "INVALID_PASSWORD",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      code: "LOGIN_SUCCESS",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
      code: "LOGIN_ERROR",
    });
  }
};

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      code: "LOGOUT_SUCCESS",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during logout",
      code: "LOGOUT_ERROR",
    });
  }
};

/**
 * @desc Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    // User ID is available from authMiddleware
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

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
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving profile",
      code: "PROFILE_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/auth/update-profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, addresses } = req.body;

    // Input validation
    const validation = validateUpdateProfile(req.body);
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
    if (fullName) {
      user.fullName = fullName.trim();
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber.replace(/\D/g, "");
    }

    if (addresses && Array.isArray(addresses)) {
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
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating profile",
      code: "PROFILE_UPDATE_ERROR",
    });
  }
};

/**
 * @desc Change user password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Input validation
    const validation = validateChangePassword(req.body);
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

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
        code: "INVALID_CURRENT_PASSWORD",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
        code: "PASSWORD_MISMATCH",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    // Create new JWT token (to refresh session)
    const newToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    // Update cookie with new token
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      code: "PASSWORD_CHANGED",
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
      code: "PASSWORD_CHANGE_ERROR",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
