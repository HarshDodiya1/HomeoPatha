const Product = require("../models/Product.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all active products with pagination and filters
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1 and limit between 1-100.",
        code: "INVALID_PAGINATION",
      });
    }

    // Filters - Only show active products
    const filters = { isActive: true };

    // Search by title, category, or description
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { tags: { $in: [new RegExp(req.query.search, "i")] } },
      ];
    }

    // Filter by category
    if (req.query.category) {
      filters.category = { $regex: req.query.category, $options: "i" };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filters.currentPrice = {};
      if (req.query.minPrice) {
        filters.currentPrice.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.currentPrice.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filter by minimum rating
    if (req.query.minRating) {
      filters.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Filter by tags
    if (req.query.tags) {
      const tagsArray = req.query.tags.split(",").map((tag) => tag.trim());
      filters.tags = { $in: tagsArray };
    }

    // Sort options
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Validate sort field
    const allowedSortFields = [
      "createdAt",
      "title",
      "currentPrice",
      "rating",
      "category",
    ];
    if (allowedSortFields.includes(sortBy)) {
      sortOption[sortBy] = sortOrder;
    } else {
      sortOption.createdAt = -1; // Default sort
    }

    // Get products with filters
    const products = await Product.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("-__v") // Exclude version key
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get unique categories for filtering
    const categories = await Product.distinct("category", { isActive: true });

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      code: "PRODUCTS_RETRIEVED",
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        categories: categories.sort(),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
        code: "INVALID_PRODUCT_ID",
      });
    }

    // Find product - Only active products
    const product = await Product.findOne({
      _id: id,
      isActive: true,
    })
      .select("-__v")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
      });
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      _id: { $ne: id }, // Exclude current product
      category: product.category,
      isActive: true,
    })
      .limit(4)
      .select("_id title category currentPrice oldPrice images rating")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Product details retrieved successfully",
      code: "PRODUCT_DETAILS_RETRIEVED",
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product details",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1 and limit between 1-100.",
        code: "INVALID_PAGINATION",
      });
    }

    // Validate category
    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
        code: "CATEGORY_REQUIRED",
      });
    }

    // Filters
    const filters = {
      category: { $regex: category, $options: "i" },
      isActive: true,
    };

    // Additional filters
    if (req.query.minPrice || req.query.maxPrice) {
      filters.currentPrice = {};
      if (req.query.minPrice) {
        filters.currentPrice.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.currentPrice.$lte = parseFloat(req.query.maxPrice);
      }
    }

    if (req.query.minRating) {
      filters.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Sort options
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const allowedSortFields = ["createdAt", "title", "currentPrice", "rating"];
    if (allowedSortFields.includes(sortBy)) {
      sortOption[sortBy] = sortOrder;
    } else {
      sortOption.createdAt = -1;
    }

    // Get products in category
    const products = await Product.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();

    // Get total count
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get category statistics
    const categoryStats = await Product.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: "$currentPrice" },
          minPrice: { $min: "$currentPrice" },
          maxPrice: { $max: "$currentPrice" },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: `Products in category '${category}' retrieved successfully`,
      code: "CATEGORY_PRODUCTS_RETRIEVED",
      data: {
        category,
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: categoryStats[0] || {
          totalProducts: 0,
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          avgRating: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products by category",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
};
