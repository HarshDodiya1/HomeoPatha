const express = require("express");
const router = express.Router();
const {
  getActiveHeroImages,
  getActiveStickyBanner,
} = require("../controllers/adminSiteSettingsController.js");

/**
 * @swagger
 * /api/site-settings/hero-images:
 *   get:
 *     summary: Get active hero images (Public)
 *     description: Retrieve all active hero images for the carousel
 *     tags:
 *       - Site Settings
 *     responses:
 *       200:
 *         description: Active hero images retrieved successfully
 */
router.get("/hero-images", getActiveHeroImages);

/**
 * @swagger
 * /api/site-settings/sticky-banner:
 *   get:
 *     summary: Get active sticky banner (Public)
 *     description: Retrieve the currently active sticky banner
 *     tags:
 *       - Site Settings
 *     responses:
 *       200:
 *         description: Active sticky banner retrieved successfully
 */
router.get("/sticky-banner", getActiveStickyBanner);

module.exports = router;
