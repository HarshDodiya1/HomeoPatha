const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware.js");
const {
  getAllHeroImages,
  createHeroImage,
  updateHeroImage,
  toggleHeroImage,
  deleteHeroImage,
  getAllStickyBanners,
  createStickyBanner,
  updateStickyBanner,
  toggleStickyBanner,
  deleteStickyBanner,
} = require("../../controllers/adminSiteSettingsController.js");

/**
 * @swagger
 * /api/admin/site-settings/hero-images:
 *   get:
 *     summary: Get all hero images (Admin only)
 *     description: Retrieve all hero images for the carousel
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Hero images retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/hero-images", authMiddleware, getAllHeroImages);

/**
 * @swagger
 * /api/admin/site-settings/hero-images:
 *   post:
 *     summary: Create a new hero image (Admin only)
 *     description: Add a new hero image to the carousel
 *     tags:
 *       - Admin - Site Settings
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
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the hero image
 *               title:
 *                 type: string
 *                 description: Optional title for the image
 *               subtitle:
 *                 type: string
 *                 description: Optional subtitle for the image
 *               isActive:
 *                 type: boolean
 *                 description: Whether the image is active
 *               order:
 *                 type: number
 *                 description: Display order of the image
 *     responses:
 *       201:
 *         description: Hero image created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/hero-images", authMiddleware, createHeroImage);

/**
 * @swagger
 * /api/admin/site-settings/hero-images/{id}:
 *   put:
 *     summary: Update a hero image (Admin only)
 *     description: Update an existing hero image
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hero image ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Hero image updated successfully
 *       404:
 *         description: Hero image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put("/hero-images/:id", authMiddleware, updateHeroImage);

/**
 * @swagger
 * /api/admin/site-settings/hero-images/{id}/toggle:
 *   patch:
 *     summary: Toggle hero image active status (Admin only)
 *     description: Toggle the active status of a hero image
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hero image ID
 *     responses:
 *       200:
 *         description: Hero image toggled successfully
 *       404:
 *         description: Hero image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.patch("/hero-images/:id/toggle", authMiddleware, toggleHeroImage);

/**
 * @swagger
 * /api/admin/site-settings/hero-images/{id}:
 *   delete:
 *     summary: Delete a hero image (Admin only)
 *     description: Delete a hero image from the carousel
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hero image ID
 *     responses:
 *       200:
 *         description: Hero image deleted successfully
 *       404:
 *         description: Hero image not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete("/hero-images/:id", authMiddleware, deleteHeroImage);

// ==================== STICKY BANNERS ====================

/**
 * @swagger
 * /api/admin/site-settings/sticky-banners:
 *   get:
 *     summary: Get all sticky banners (Admin only)
 *     description: Retrieve all sticky banners
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Sticky banners retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/sticky-banners", authMiddleware, getAllStickyBanners);

/**
 * @swagger
 * /api/admin/site-settings/sticky-banners:
 *   post:
 *     summary: Create a new sticky banner (Admin only)
 *     description: Add a new sticky banner. Only one can be active at a time.
 *     tags:
 *       - Admin - Site Settings
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
 *               - heading
 *             properties:
 *               heading:
 *                 type: string
 *                 description: The banner heading text
 *               linkText:
 *                 type: string
 *                 description: Optional link text
 *               linkUrl:
 *                 type: string
 *                 description: Optional link URL
 *               isActive:
 *                 type: boolean
 *                 description: Whether the banner is active (only one can be active)
 *     responses:
 *       201:
 *         description: Sticky banner created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/sticky-banners", authMiddleware, createStickyBanner);

/**
 * @swagger
 * /api/admin/site-settings/sticky-banners/{id}:
 *   put:
 *     summary: Update a sticky banner (Admin only)
 *     description: Update an existing sticky banner
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticky banner ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heading:
 *                 type: string
 *               linkText:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sticky banner updated successfully
 *       404:
 *         description: Sticky banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put("/sticky-banners/:id", authMiddleware, updateStickyBanner);

/**
 * @swagger
 * /api/admin/site-settings/sticky-banners/{id}/toggle:
 *   patch:
 *     summary: Toggle sticky banner active status (Admin only)
 *     description: Toggle the active status. Only one banner can be active at a time.
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticky banner ID
 *     responses:
 *       200:
 *         description: Sticky banner toggled successfully
 *       404:
 *         description: Sticky banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.patch("/sticky-banners/:id/toggle", authMiddleware, toggleStickyBanner);

/**
 * @swagger
 * /api/admin/site-settings/sticky-banners/{id}:
 *   delete:
 *     summary: Delete a sticky banner (Admin only)
 *     description: Delete a sticky banner
 *     tags:
 *       - Admin - Site Settings
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticky banner ID
 *     responses:
 *       200:
 *         description: Sticky banner deleted successfully
 *       404:
 *         description: Sticky banner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete("/sticky-banners/:id", authMiddleware, deleteStickyBanner);

module.exports = router;
