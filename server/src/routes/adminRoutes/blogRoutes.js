const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishStatus,
} = require("../../controllers/adminBlogController.js");

/**
 * @swagger
 * /api/admin/blogs:
 *   get:
 *     summary: Get all blogs (Admin only)
 *     description: Retrieve all blogs with pagination, filtering and sorting
 *     tags:
 *       - Admin - Blogs
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
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, summary, or content
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author (doctor) ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getAllBlogs);

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   get:
 *     summary: Get blog by ID (Admin only)
 *     description: Retrieve a specific blog with author details
 *     tags:
 *       - Admin - Blogs
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog details retrieved successfully
 *       400:
 *         description: Invalid blog ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, getBlogById);

/**
 * @swagger
 * /api/admin/blogs:
 *   post:
 *     summary: Create a new blog (Admin only)
 *     description: Create a new blog post with optional author reference
 *     tags:
 *       - Admin - Blogs
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Benefits of Homeopathy"
 *               summary:
 *                 type: string
 *                 example: "A brief overview of homeopathic treatments"
 *               content:
 *                 type: string
 *                 example: "<p>Full article content here...</p>"
 *               coverImage:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["homeopathy", "health", "natural"]
 *               author:
 *                 type: string
 *                 description: Doctor ID (optional)
 *                 example: "60d0fe4f5311236168a109ca"
 *               published:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createBlog);

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   put:
 *     summary: Update a blog (Admin only)
 *     description: Update an existing blog post
 *     tags:
 *       - Admin - Blogs
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *               content:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               author:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Blog or author not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, updateBlog);

/**
 * @swagger
 * /api/admin/blogs/{id}:
 *   delete:
 *     summary: Delete a blog (Admin only)
 *     description: Permanently delete a blog post
 *     tags:
 *       - Admin - Blogs
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       400:
 *         description: Invalid blog ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteBlog);

/**
 * @swagger
 * /api/admin/blogs/{id}/toggle-publish:
 *   put:
 *     summary: Toggle blog publish status (Admin only)
 *     description: Toggle between published and draft status
 *     tags:
 *       - Admin - Blogs
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog publish status toggled successfully
 *       400:
 *         description: Invalid blog ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.put("/:id/toggle-publish", authMiddleware, togglePublishStatus);

module.exports = router;
