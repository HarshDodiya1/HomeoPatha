const express = require("express");
const router = express.Router();
const {
  getPublishedBlogs,
  getBlogById,
  getAllTags,
  getFeaturedBlogs,
  getBlogBySlug,
} = require("../controllers/blogController.js");

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all published blogs
 *     description: Retrieve all published blogs with pagination and filtering
 *     tags:
 *       - Blogs
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
 *           maximum: 50
 *         description: Items per page (max 50)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or summary
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author (doctor) ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [publishedAt, title, createdAt]
 *           default: publishedAt
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     blogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       400:
 *         description: Invalid pagination parameters
 *       500:
 *         description: Server error
 */
router.get("/", getPublishedBlogs);

/**
 * @swagger
 * /api/blogs/tags:
 *   get:
 *     summary: Get all tags from published blogs
 *     description: Retrieve all unique tags with their counts
 *     tags:
 *       - Blogs
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: string
 *                           count:
 *                             type: integer
 *       500:
 *         description: Server error
 */
router.get("/tags", getAllTags);

/**
 * @swagger
 * /api/blogs/featured:
 *   get:
 *     summary: Get featured/recent blogs
 *     description: Retrieve most recent published blogs
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           maximum: 10
 *         description: Number of blogs to return (max 10)
 *     responses:
 *       200:
 *         description: Featured blogs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/featured", getFeaturedBlogs);

/**
 * @swagger
 * /api/blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     description: Retrieve a single published blog by its URL-friendly slug
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog slug (URL-friendly title)
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       type: object
 *       404:
 *         description: Blog not found or not published
 *       500:
 *         description: Server error
 */
router.get("/slug/:slug", getBlogBySlug);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     description: Retrieve a single published blog with full content and author details
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       type: object
 *       400:
 *         description: Invalid blog ID format
 *       404:
 *         description: Blog not found or not published
 *       500:
 *         description: Server error
 */
router.get("/:id", getBlogById);

module.exports = router;
