const Feedback = require("../models/Feedbacks.js");

/**
 * @desc    Get all published feedbacks/testimonials
 * @route   GET /api/feedbacks
 * @access  Public
 */
const getPublishedFeedbacks = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 50.",
        code: "INVALID_PAGINATION",
      });
    }

    // Only show published feedbacks
    const filters = { isPublished: true };

    // Filter by minimum stars if specified
    if (req.query.minStars) {
      const minStars = parseInt(req.query.minStars);
      if (minStars >= 1 && minStars <= 5) {
        filters.stars = { $gte: minStars };
      }
    }

    // Sort options (only allow certain fields for public)
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt";
    const allowedSortFields = ["createdAt", "stars"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption[sortField] = sortOrder;

    // Get feedbacks
    const feedbacks = await Feedback.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalFeedbacks = await Feedback.countDocuments(filters);
    const totalPages = Math.ceil(totalFeedbacks / limit);

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

module.exports = {
  getPublishedFeedbacks,
};
