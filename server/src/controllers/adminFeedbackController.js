const Feedback = require("../models/Feedbacks.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all feedbacks with pagination and filters
 * @route   GET /api/admin/feedbacks
 * @access  Admin
 */
const getAllFeedbacks = async (req, res) => {
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
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1 and limit must be >= 1.",
        code: "INVALID_PAGINATION",
      });
    }

    // Filters
    const filters = {};

    // Search by userName or quote
    if (req.query.search) {
      filters.$or = [
        { userName: { $regex: req.query.search, $options: "i" } },
        { quote: { $regex: req.query.search, $options: "i" } },
        { userRole: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by published status
    if (req.query.isPublished !== undefined) {
      filters.isPublished = req.query.isPublished === "true";
    }

    // Filter by stars
    if (req.query.stars) {
      const stars = parseInt(req.query.stars);
      if (stars >= 1 && stars <= 5) {
        filters.stars = stars;
      }
    }

    // Sort options
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption[sortBy] = sortOrder;

    // Get feedbacks with filters
    const feedbacks = await Feedback.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalFeedbacks = await Feedback.countDocuments(filters);
    const totalPages = Math.ceil(totalFeedbacks / limit);

    // Calculate statistics
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          publishedFeedbacks: {
            $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] },
          },
          unpublishedFeedbacks: {
            $sum: { $cond: [{ $eq: ["$isPublished", false] }, 1, 0] },
          },
          averageRating: { $avg: "$stars" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Feedbacks retrieved successfully",
      code: "FEEDBACKS_RETRIEVED",
      data: {
        feedbacks,
        pagination: {
          currentPage: page,
          totalPages,
          totalFeedbacks,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: stats[0] || {
          totalFeedbacks: 0,
          publishedFeedbacks: 0,
          unpublishedFeedbacks: 0,
          averageRating: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedbacks",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific feedback by ID
 * @route   GET /api/admin/feedbacks/:id
 * @access  Admin
 */
const getFeedbackById = async (req, res) => {
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

    // Validate feedback ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format",
        code: "INVALID_FEEDBACK_ID",
      });
    }

    // Find feedback
    const feedback = await Feedback.findById(id).lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
        code: "FEEDBACK_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback details retrieved successfully",
      code: "FEEDBACK_DETAILS_RETRIEVED",
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback details",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new feedback
 * @route   POST /api/admin/feedbacks
 * @access  Admin
 */
const createFeedback = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { quote, userName, userRole, stars, socialLinks, isPublished } = req.body;

    // Validate required fields
    if (!quote || !quote.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quote is required",
        code: "VALIDATION_ERROR",
      });
    }

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Stars rating is required and must be between 1 and 5",
        code: "VALIDATION_ERROR",
      });
    }

    // Create feedback
    const feedbackData = {
      quote: quote.trim(),
      userName: userName?.trim() || "",
      userRole: userRole?.trim() || "",
      stars: parseInt(stars),
      socialLinks: {
        whatsapp: socialLinks?.whatsapp?.trim() || "",
        instagram: socialLinks?.instagram?.trim() || "",
        facebook: socialLinks?.facebook?.trim() || "",
      },
      isPublished: isPublished !== undefined ? isPublished : true,
    };

    const feedback = await Feedback.create(feedbackData);

    return res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      code: "FEEDBACK_CREATED",
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create feedback",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a feedback
 * @route   PUT /api/admin/feedbacks/:id
 * @access  Admin
 */
const updateFeedback = async (req, res) => {
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
    const { quote, userName, userRole, stars, socialLinks, isPublished } = req.body;

    // Validate feedback ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format",
        code: "INVALID_FEEDBACK_ID",
      });
    }

    // Find existing feedback
    const existingFeedback = await Feedback.findById(id);
    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
        code: "FEEDBACK_NOT_FOUND",
      });
    }

    // Validate stars if provided
    if (stars !== undefined && (stars < 1 || stars > 5)) {
      return res.status(400).json({
        success: false,
        message: "Stars rating must be between 1 and 5",
        code: "VALIDATION_ERROR",
      });
    }

    // Prepare update data
    const updateData = {};

    if (quote !== undefined) updateData.quote = quote.trim();
    if (userName !== undefined) updateData.userName = userName.trim();
    if (userRole !== undefined) updateData.userRole = userRole.trim();
    if (stars !== undefined) updateData.stars = parseInt(stars);
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    if (socialLinks !== undefined) {
      updateData.socialLinks = {
        whatsapp: socialLinks?.whatsapp?.trim() || existingFeedback.socialLinks?.whatsapp || "",
        instagram: socialLinks?.instagram?.trim() || existingFeedback.socialLinks?.instagram || "",
        facebook: socialLinks?.facebook?.trim() || existingFeedback.socialLinks?.facebook || "",
      };
    }

    // Update feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      code: "FEEDBACK_UPDATED",
      data: {
        feedback: updatedFeedback,
      },
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a feedback
 * @route   DELETE /api/admin/feedbacks/:id
 * @access  Admin
 */
const deleteFeedback = async (req, res) => {
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

    // Validate feedback ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format",
        code: "INVALID_FEEDBACK_ID",
      });
    }

    // Find and delete feedback
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
        code: "FEEDBACK_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
      code: "FEEDBACK_DELETED",
      data: {
        feedback: deletedFeedback,
      },
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle feedback publish status
 * @route   PUT /api/admin/feedbacks/:id/toggle-publish
 * @access  Admin
 */
const togglePublishStatus = async (req, res) => {
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

    // Validate feedback ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format",
        code: "INVALID_FEEDBACK_ID",
      });
    }

    // Find feedback
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
        code: "FEEDBACK_NOT_FOUND",
      });
    }

    // Toggle publish status
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { isPublished: !feedback.isPublished },
      { new: true }
    ).lean();

    return res.status(200).json({
      success: true,
      message: `Feedback ${updatedFeedback.isPublished ? "published" : "unpublished"} successfully`,
      code: updatedFeedback.isPublished ? "FEEDBACK_PUBLISHED" : "FEEDBACK_UNPUBLISHED",
      data: {
        feedback: updatedFeedback,
      },
    });
  } catch (error) {
    console.error("Error toggling feedback publish status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle feedback publish status",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  togglePublishStatus,
};
