const Blog = require("../models/Blog.js");
const Doctor = require("../models/Doctor.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all blogs with pagination and filters
 * @route   GET /api/admin/blogs
 * @access  Admin
 */
const getAllBlogs = async (req, res) => {
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

    // Search by title or content
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { summary: { $regex: req.query.search, $options: "i" } },
        { content: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by published status
    if (req.query.published !== undefined) {
      filters.published = req.query.published === "true";
    }

    // Filter by author (doctor)
    if (req.query.author) {
      if (mongoose.Types.ObjectId.isValid(req.query.author)) {
        filters.author = req.query.author;
      }
    }

    // Filter by tag
    if (req.query.tag) {
      filters.tags = { $in: [req.query.tag.toLowerCase()] };
    }

    // Sort options
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption[sortBy] = sortOrder;

    // Get blogs with filters and populate author
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
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(filters);
    const totalPages = Math.ceil(totalBlogs / limit);

    // Calculate statistics
    const stats = await Blog.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ["$published", true] }, 1, 0] },
          },
          draftBlogs: {
            $sum: { $cond: [{ $eq: ["$published", false] }, 1, 0] },
          },
        },
      },
    ]);

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
        stats: stats[0] || {
          totalBlogs: 0,
          publishedBlogs: 0,
          draftBlogs: 0,
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
 * @desc    Get specific blog by ID
 * @route   GET /api/admin/blogs/:id
 * @access  Admin
 */
const getBlogById = async (req, res) => {
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

    // Validate blog ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
        code: "INVALID_BLOG_ID",
      });
    }

    // Find blog with author populated
    const blog = await Blog.findById(id)
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
      message: "Blog details retrieved successfully",
      code: "BLOG_DETAILS_RETRIEVED",
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve blog details",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new blog
 * @route   POST /api/admin/blogs
 * @access  Admin
 */
const createBlog = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { title, summary, content, coverImage, tags, author, published } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
        code: "VALIDATION_ERROR",
      });
    }

    // Validate author if provided
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({
          success: false,
          message: "Invalid author ID format",
          code: "INVALID_AUTHOR_ID",
        });
      }

      const doctorExists = await Doctor.findById(author);
      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: "Author (doctor) not found",
          code: "AUTHOR_NOT_FOUND",
        });
      }
    }

    // Create blog
    const blogData = {
      title: title.trim(),
      summary: summary?.trim() || "",
      content: content || "",
      coverImage: coverImage || "",
      tags: Array.isArray(tags) ? tags.map(tag => tag.toLowerCase().trim()) : [],
      author: author || null,
      published: published || false,
    };

    // Set publishedAt if publishing
    if (published) {
      blogData.publishedAt = new Date();
    }

    const blog = await Blog.create(blogData);

    // Fetch created blog with author populated
    const populatedBlog = await Blog.findById(blog._id)
      .populate({
        path: "author",
        select: "fullName email qualification specialization profileImage",
        populate: {
          path: "specialization",
          select: "name",
        },
      })
      .lean();

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      code: "BLOG_CREATED",
      data: {
        blog: populatedBlog,
      },
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a blog
 * @route   PUT /api/admin/blogs/:id
 * @access  Admin
 */
const updateBlog = async (req, res) => {
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
    const { title, summary, content, coverImage, tags, author, published } = req.body;

    // Validate blog ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
        code: "INVALID_BLOG_ID",
      });
    }

    // Find existing blog
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        code: "BLOG_NOT_FOUND",
      });
    }

    // Validate author if provided
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({
          success: false,
          message: "Invalid author ID format",
          code: "INVALID_AUTHOR_ID",
        });
      }

      const doctorExists = await Doctor.findById(author);
      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: "Author (doctor) not found",
          code: "AUTHOR_NOT_FOUND",
        });
      }
    }

    // Prepare update data
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.map(tag => tag.toLowerCase().trim()) : [];
    }
    if (author !== undefined) updateData.author = author || null;
    if (published !== undefined) {
      updateData.published = published;
      // Set publishedAt when first publishing
      if (published && !existingBlog.published) {
        updateData.publishedAt = new Date();
      }
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "author",
        select: "fullName email qualification specialization profileImage",
        populate: {
          path: "specialization",
          select: "name",
        },
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      code: "BLOG_UPDATED",
      data: {
        blog: updatedBlog,
      },
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a blog
 * @route   DELETE /api/admin/blogs/:id
 * @access  Admin
 */
const deleteBlog = async (req, res) => {
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

    // Validate blog ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
        code: "INVALID_BLOG_ID",
      });
    }

    // Find and delete blog
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        code: "BLOG_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      code: "BLOG_DELETED",
      data: {
        blog: deletedBlog,
      },
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle blog publish status
 * @route   PUT /api/admin/blogs/:id/toggle-publish
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

    // Validate blog ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
        code: "INVALID_BLOG_ID",
      });
    }

    // Find blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
        code: "BLOG_NOT_FOUND",
      });
    }

    // Toggle publish status
    const updateData = {
      published: !blog.published,
    };

    // Set publishedAt when first publishing
    if (!blog.published) {
      updateData.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate({
        path: "author",
        select: "fullName email qualification specialization profileImage",
        populate: {
          path: "specialization",
          select: "name",
        },
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: `Blog ${updatedBlog.published ? "published" : "unpublished"} successfully`,
      code: updatedBlog.published ? "BLOG_PUBLISHED" : "BLOG_UNPUBLISHED",
      data: {
        blog: updatedBlog,
      },
    });
  } catch (error) {
    console.error("Error toggling blog publish status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle blog publish status",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishStatus,
};
