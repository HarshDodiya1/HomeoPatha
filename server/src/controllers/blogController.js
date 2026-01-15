const Blog = require("../models/Blog.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all published blogs with pagination
 * @route   GET /api/blogs
 * @access  Public
 */
const getPublishedBlogs = async (req, res) => {
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

    // Only show published blogs
    const filters = { published: true };

    // Search by title or content
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { summary: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by tag
    if (req.query.tag) {
      filters.tags = { $in: [req.query.tag.toLowerCase()] };
    }

    // Filter by author (doctor)
    if (req.query.author) {
      if (mongoose.Types.ObjectId.isValid(req.query.author)) {
        filters.author = req.query.author;
      }
    }

    // Sort options (only allow certain fields for public)
    let sortOption = {};
    const sortBy = req.query.sortBy || "publishedAt";
    const allowedSortFields = ["publishedAt", "title", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "publishedAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption[sortField] = sortOrder;

    // Get blogs with author populated
    const blogs = await Blog.find(filters)
      .populate({
        path: "author",
        select: "userId qualification specialization images experience",
        populate: [
          {
            path: "userId",
            select: "fullName email",
          },
        ],
      })
      .select("-content") // Exclude full content in list view for performance
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(filters);
    const totalPages = Math.ceil(totalBlogs / limit);

    return res.status(200).json({
      success: true,
      message: "Blogs retrieved successfully",
      code: "BLOGS_RETRIEVED",
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve blogs",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single published blog by ID with full content
 * @route   GET /api/blogs/:id
 * @access  Public
 */
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate blog ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
        code: "INVALID_BLOG_ID",
      });
    }

    // Find published blog with full author details
    const blog = await Blog.findOne({ _id: id, published: true })
      .populate({
        path: "author",
        select: "userId qualification specialization images experience about",
        populate: [
          {
            path: "userId",
            select: "fullName email",
          },
        ],
      })
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or not published",
        code: "BLOG_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      code: "BLOG_RETRIEVED",
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve blog",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all unique tags from published blogs
 * @route   GET /api/blogs/tags
 * @access  Public
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { published: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
    ]);

    return res.status(200).json({
      success: true,
      message: "Tags retrieved successfully",
      code: "TAGS_RETRIEVED",
      data: {
        tags,
      },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tags",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get recent/featured blogs
 * @route   GET /api/blogs/featured
 * @access  Public
 */
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get most recent published blogs
    const blogs = await Blog.find({ published: true })
      .populate({
        path: "author",
        select: "userId qualification specialization images experience",
        populate: [
          {
            path: "userId",
            select: "fullName email",
          },
        ],
      })
      .select("-content")
      .sort({ publishedAt: -1 })
      .limit(Math.min(limit, 10))
      .lean();

    return res.status(200).json({
      success: true,
      message: "Featured blogs retrieved successfully",
      code: "FEATURED_BLOGS_RETRIEVED",
      data: {
        blogs,
      },
    });
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve featured blogs",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single blog by slug
 * @route   GET /api/blogs/slug/:slug
 * @access  Public
 */
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, published: true })
      .populate({
        path: "author",
        select: "userId qualification specialization images experience about",
        populate: [
          {
            path: "userId",
            select: "fullName email",
          },
        ],
      })
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        code: "BLOG_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      code: "BLOG_RETRIEVED",
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve blog",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  getPublishedBlogs,
  getBlogById,
  getAllTags,
  getFeaturedBlogs,
  getBlogBySlug,
};
