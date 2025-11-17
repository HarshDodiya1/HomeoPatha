const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController.js");

/**
 * Public Routes
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient)
 * @access  Public
 * @body    {fullName, email, password, confirmPassword, phoneNumber}
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    {email, password}
 */
router.post("/login", login);

/**
 * Private Routes (Requires Authentication)
 */

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authMiddleware, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authMiddleware, getMe);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 * @body    {fullName?, phoneNumber?, addresses?}
 */
router.put("/update-profile", authMiddleware, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @body    {currentPassword, newPassword, confirmNewPassword}
 */
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
