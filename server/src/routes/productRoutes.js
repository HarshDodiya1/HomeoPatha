const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
} = require("../controllers/productController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController.js");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all active products
 *     description: Retrieve list of all active products with filtering, pagination, and search (Public access)
 *     tags:
 *       - Products
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
 *           default: 12
 *           maximum: 100
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, category, description, or tags
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
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
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *         example: "pain relief,natural"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, currentPrice, rating, category]
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
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           category:
 *                             type: string
 *                           description:
 *                             type: string
 *                           badge:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           oldPrice:
 *                             type: number
 *                           currentPrice:
 *                             type: number
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of all available categories
 *       400:
 *         description: Invalid pagination parameters
 *       500:
 *         description: Server error
 */
router.get("/", getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get specific product details
 *     description: Retrieve complete details of a specific active product with related products
 *     tags:
 *       - Products
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
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         category:
 *                           type: string
 *                         description:
 *                           type: string
 *                         badge:
 *                           type: string
 *                         rating:
 *                           type: number
 *                         oldPrice:
 *                           type: number
 *                         currentPrice:
 *                           type: number
 *                         images:
 *                           type: array
 *                           items:
 *                             type: string
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                         isActive:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *                     relatedProducts:
 *                       type: array
 *                       description: Related products from the same category
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           category:
 *                             type: string
 *                           currentPrice:
 *                             type: number
 *                           oldPrice:
 *                             type: number
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           rating:
 *                             type: number
 *       400:
 *         description: Invalid product ID format
 *       404:
 *         description: Product not found or inactive
 *       500:
 *         description: Server error
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve all active products in a specific category with pagination and filters
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Product category
 *         example: "Homeopathic Medicine"
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
 *           default: 12
 *           maximum: 100
 *         description: Items per page (max 100)
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
 *         description: Products in category retrieved successfully
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
 *                   example: "Products in category 'Homeopathic Medicine' retrieved successfully"
 *                 code:
 *                   type: string
 *                   example: "CATEGORY_PRODUCTS_RETRIEVED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
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
 *                         avgPrice:
 *                           type: number
 *                         minPrice:
 *                           type: number
 *                         maxPrice:
 *                           type: number
 *                         avgRating:
 *                           type: number
 *       400:
 *         description: Invalid parameters or category required
 *       500:
 *         description: Server error
 */
router.get("/category/:category", getProductsByCategory);

/**
 * @swagger
 * /api/products/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve current user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/cart", authMiddleware, getCart);

/**
 * @swagger
 * /api/products/cart/items:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the user's cart
 *     tags:
 *       - Cart
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
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               quantity:
 *                 type: number
 *                 default: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post("/cart/items", authMiddleware, addToCart);

/**
 * @swagger
 * /api/products/cart/items/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific item in cart
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Invalid quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Server error
 */
router.put("/cart/items/:productId", authMiddleware, updateCartItem);

/**
 * @swagger
 * /api/products/cart/items/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Server error
 */
router.delete("/cart/items/:productId", authMiddleware, removeFromCart);

/**
 * @swagger
 * /api/products/cart:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
router.delete("/cart", authMiddleware, clearCart);

module.exports = router;
