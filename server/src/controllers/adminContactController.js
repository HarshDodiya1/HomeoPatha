const ContactMessage = require("../models/ContactMessage.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all contact messages with pagination and filters
 * @route   GET /api/admin/contacts
 * @access  Admin
 */
const getAllContactMessages = async (req, res) => {
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
        message: "Invalid pagination parameters. Page must be >= 1 and limit between 1-100.",
        code: "INVALID_PAGINATION",
      });
    }

    // Filters
    const filters = {};

    // Search by name, email, or phone
    if (req.query.search) {
      filters.$or = [
        { fullName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { phoneNumber: { $regex: req.query.search, $options: "i" } },
        { message: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by email
    if (req.query.email) {
      filters.email = { $regex: req.query.email, $options: "i" };
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) {
        filters.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Sort options
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption[sortBy] = sortOrder;

    // Get contact messages with filters
    const contactMessages = await ContactMessage.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalMessages = await ContactMessage.countDocuments(filters);
    const totalPages = Math.ceil(totalMessages / limit);

    // Calculate statistics
    const stats = {
      totalMessages,
      messagesThisMonth: await ContactMessage.countDocuments({
        ...filters,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      messagesThisWeek: await ContactMessage.countDocuments({
        ...filters,
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
      messagesToday: await ContactMessage.countDocuments({
        ...filters,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Contact messages retrieved successfully",
      code: "CONTACT_MESSAGES_RETRIEVED",
      data: {
        contactMessages,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve contact messages",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific contact message by ID
 * @route   GET /api/admin/contacts/:id
 * @access  Admin
 */
const getContactMessageById = async (req, res) => {
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

    // Validate contact message ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message ID format",
        code: "INVALID_CONTACT_MESSAGE_ID",
      });
    }

    // Find contact message
    const contactMessage = await ContactMessage.findById(id).lean();

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
        code: "CONTACT_MESSAGE_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message details retrieved successfully",
      code: "CONTACT_MESSAGE_DETAILS_RETRIEVED",
      data: {
        contactMessage,
      },
    });
  } catch (error) {
    console.error("Error fetching contact message details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve contact message details",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete contact message
 * @route   DELETE /api/admin/contacts/:id
 * @access  Admin
 */
const deleteContactMessage = async (req, res) => {
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

    // Validate contact message ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message ID format",
        code: "INVALID_CONTACT_MESSAGE_ID",
      });
    }

    // Find and delete contact message
    const contactMessage = await ContactMessage.findByIdAndDelete(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
        code: "CONTACT_MESSAGE_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
      code: "CONTACT_MESSAGE_DELETED",
      data: {
        deletedMessage: {
          id: contactMessage._id,
          fullName: contactMessage.fullName,
          email: contactMessage.email,
          phoneNumber: contactMessage.phoneNumber,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  getAllContactMessages,
  getContactMessageById,
  deleteContactMessage,
};
