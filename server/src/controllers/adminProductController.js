const Product = require("../models/Product.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all products with pagination and filters
 * @route   GET /api/admin/products
 * @access  Admin
 */
const getAllProducts = async (req, res) => {
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
    
    // Search by title or category
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by category
    if (req.query.category) {
      filters.category = { $regex: req.query.category, $options: "i" };
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
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

    // Filter by rating
    if (req.query.minRating) {
      filters.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Sort options
    let sortOption = {};
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption[sortBy] = sortOrder;

    // Get products with filters
    const products = await Product.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    // Calculate statistics
    const stats = await Product.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          avgPrice: { $avg: "$currentPrice" },
          minPrice: { $min: "$currentPrice" },
          maxPrice: { $max: "$currentPrice" },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          inactiveProducts: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
        },
      },
    ]);

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
        stats: stats[0] || {
          totalProducts: 0,
          avgRating: 0,
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          activeProducts: 0,
          inactiveProducts: 0,
        },
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
 * @route   GET /api/admin/products/:id
 * @access  Admin
 */
const getProductById = async (req, res) => {
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

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
        code: "INVALID_PRODUCT_ID",
      });
    }

    // Find product
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product details retrieved successfully",
      code: "PRODUCT_DETAILS_RETRIEVED",
      data: {
        product,
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
 * @desc    Create new product
 * @route   POST /api/admin/products
 * @access  Admin
 */
const createProduct = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const {
      title,
      category,
      description,
      badge,
      rating,
      oldPrice,
      currentPrice,
      images,
      tags,
      isActive,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
        code: "TITLE_REQUIRED",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product category is required",
        code: "CATEGORY_REQUIRED",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product description is required",
        code: "DESCRIPTION_REQUIRED",
      });
    }

    if (!currentPrice || currentPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid current price is required",
        code: "INVALID_CURRENT_PRICE",
      });
    }

    // Validate old price if provided
    if (oldPrice !== undefined && oldPrice !== null && oldPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Old price cannot be negative",
        code: "INVALID_OLD_PRICE",
      });
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null && (rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
        code: "INVALID_RATING",
      });
    }

    // Validate images array
    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array of URLs",
        code: "INVALID_IMAGES_FORMAT",
      });
    }

    // Validate tags array
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array",
        code: "INVALID_TAGS_FORMAT",
      });
    }

    // Create product
    const newProduct = new Product({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      badge: badge?.trim() || undefined,
      rating: rating || 0,
      oldPrice: oldPrice || undefined,
      currentPrice,
      images: images || [],
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      code: "PRODUCT_CREATED",
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/admin/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res) => {
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
    const {
      title,
      category,
      description,
      badge,
      rating,
      oldPrice,
      currentPrice,
      images,
      tags,
      isActive,
    } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
        code: "INVALID_PRODUCT_ID",
      });
    }

    // Find product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
      });
    }

    // Validation for updates
    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: "Product title cannot be empty",
        code: "INVALID_TITLE",
      });
    }

    if (category !== undefined && (!category || !category.trim())) {
      return res.status(400).json({
        success: false,
        message: "Product category cannot be empty",
        code: "INVALID_CATEGORY",
      });
    }

    if (description !== undefined && (!description || !description.trim())) {
      return res.status(400).json({
        success: false,
        message: "Product description cannot be empty",
        code: "INVALID_DESCRIPTION",
      });
    }

    if (currentPrice !== undefined && currentPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Current price must be greater than 0",
        code: "INVALID_CURRENT_PRICE",
      });
    }

    if (oldPrice !== undefined && oldPrice !== null && oldPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Old price cannot be negative",
        code: "INVALID_OLD_PRICE",
      });
    }

    if (rating !== undefined && rating !== null && (rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
        code: "INVALID_RATING",
      });
    }

    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array of URLs",
        code: "INVALID_IMAGES_FORMAT",
      });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array",
        code: "INVALID_TAGS_FORMAT",
      });
    }

    // Update fields
    if (title !== undefined) product.title = title.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (badge !== undefined) product.badge = badge?.trim() || undefined;
    if (rating !== undefined) product.rating = rating;
    if (oldPrice !== undefined) product.oldPrice = oldPrice;
    if (currentPrice !== undefined) product.currentPrice = currentPrice;
    if (images !== undefined) product.images = images;
    if (tags !== undefined) product.tags = tags;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      code: "PRODUCT_UPDATED",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/admin/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res) => {
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

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
        code: "INVALID_PRODUCT_ID",
      });
    }

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      code: "PRODUCT_DELETED",
      data: {
        deletedProduct: {
          id: product._id,
          title: product.title,
          category: product.category,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
