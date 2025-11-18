const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/adminProductController.js");

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products (Admin only)
 *     description: Retrieve list of all products with advanced filtering, pagination, search, and statistics
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, category, or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, currentPrice, rating]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Products retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "PRODUCTS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalProducts:
 *                           type: number
 *                         itemsPerPage:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalProducts:
 *                           type: number
 *                         avgRating:
 *                           type: number
 *                         avgPrice:
 *                           type: number
 *                         minPrice:
 *                           type: number
 *                         maxPrice:
 *                           type: number
 *                         activeProducts:
 *                           type: number
 *                         inactiveProducts:
 *                           type: number
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAllProducts);

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create new product (Admin only)
 *     description: Create a new product with all details including images
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - currentPrice
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Arnica Montana 30C"
 *               category:
 *                 type: string
 *                 example: "Homeopathic Medicine"
 *               description:
 *                 type: string
 *                 example: "Used for bruises, muscle soreness, and trauma"
 *               badge:
 *                 type: string
 *                 example: "Best Seller"
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *               oldPrice:
 *                 type: number
 *                 example: 299
 *               currentPrice:
 *                 type: number
 *                 example: 249
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["pain relief", "homeopathy", "natural"]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *                 code:
 *                   type: string
 *                   example: "PRODUCT_CREATED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get specific product (Admin only)
 *     description: Retrieve complete details of a specific product
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product details retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "PRODUCT_DETAILS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getProductById);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     description: Update product details including images and pricing
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Arnica Montana 30C"
 *               category:
 *                 type: string
 *                 example: "Homeopathic Medicine"
 *               description:
 *                 type: string
 *                 example: "Used for bruises, muscle soreness, and trauma"
 *               badge:
 *                 type: string
 *                 example: "Best Seller"
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *               oldPrice:
 *                 type: number
 *                 example: 299
 *               currentPrice:
 *                 type: number
 *                 example: 249
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["pain relief", "homeopathy", "natural"]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 code:
 *                   type: string
 *                   example: "PRODUCT_UPDATED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or invalid product ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     description: Permanently delete a product from the system
 *     tags:
 *       - Admin - Products
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product deleted successfully"
 *                 code:
 *                   type: string
 *                   example: "PRODUCT_DELETED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedProduct:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         category:
 *                           type: string
 *       400:
 *         description: Invalid product ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteProduct);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - currentPrice
 *       properties:
 *         _id:
 *           type: string
 *           description: Product ID
 *         title:
 *           type: string
 *           description: Product title
 *         category:
 *           type: string
 *           description: Product category
 *         description:
 *           type: string
 *           description: Product description
 *         badge:
 *           type: string
 *           description: Product badge (e.g., "Best Seller", "New")
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Product rating
 *         oldPrice:
 *           type: number
 *           description: Original price
 *         currentPrice:
 *           type: number
 *           description: Current selling price
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Product tags
 *         isActive:
 *           type: boolean
 *           description: Whether product is active/visible
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

module.exports = router;
