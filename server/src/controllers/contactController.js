const ContactMessage = require("../models/ContactMessage.js");

/**
 * @desc    Submit a contact message (Public)
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactMessage = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        code: "MISSING_FIELDS",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    }

    // Validate phone number (basic validation - adjust based on your requirements)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[^0-9]/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. Please enter a 10-digit number",
        code: "INVALID_PHONE",
      });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long",
        code: "MESSAGE_TOO_SHORT",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message must not exceed 1000 characters",
        code: "MESSAGE_TOO_LONG",
      });
    }

    // Create new contact message
    const contactMessage = await ContactMessage.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      code: "CONTACT_MESSAGE_CREATED",
      data: {
        contactMessage: {
          id: contactMessage._id,
          fullName: contactMessage.fullName,
          email: contactMessage.email,
          createdAt: contactMessage.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact message. Please try again later.",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  submitContactMessage,
};
