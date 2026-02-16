const { HeroImage, StickyBanner } = require("../models/SiteSettings.js");

// ==================== HERO IMAGES ====================

/**
 * @desc Get all hero images
 * @route GET /api/admin/site-settings/hero-images
 * @access Private (Admin)
 */
const getAllHeroImages = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const heroImages = await HeroImage.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Hero images retrieved successfully",
      code: "HERO_IMAGES_RETRIEVED",
      data: {
        heroImages,
        total: heroImages.length,
      },
    });
  } catch (error) {
    console.error("Get hero images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hero images",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Get active hero images (public)
 * @route GET /api/site-settings/hero-images
 * @access Public
 */
const getActiveHeroImages = async (req, res) => {
  try {
    const heroImages = await HeroImage.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Active hero images retrieved successfully",
      code: "HERO_IMAGES_RETRIEVED",
      data: {
        heroImages,
        total: heroImages.length,
      },
    });
  } catch (error) {
    console.error("Get active hero images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hero images",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Create a hero image
 * @route POST /api/admin/site-settings/hero-images
 * @access Private (Admin)
 */
const createHeroImage = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { imageUrl, mobileImageUrl, title, subtitle, isActive, order } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
        code: "VALIDATION_ERROR",
      });
    }

    const heroImage = new HeroImage({
      imageUrl,
      mobileImageUrl: mobileImageUrl || "",
      title: title || "",
      subtitle: subtitle || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await heroImage.save();

    res.status(201).json({
      success: true,
      message: "Hero image created successfully",
      code: "HERO_IMAGE_CREATED",
      data: {
        heroImage,
      },
    });
  } catch (error) {
    console.error("Create hero image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create hero image",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Update a hero image
 * @route PUT /api/admin/site-settings/hero-images/:id
 * @access Private (Admin)
 */
const updateHeroImage = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;
    const { imageUrl, mobileImageUrl, title, subtitle, isActive, order } = req.body;

    const heroImage = await HeroImage.findById(id);

    if (!heroImage) {
      return res.status(404).json({
        success: false,
        message: "Hero image not found",
        code: "NOT_FOUND",
      });
    }

    if (imageUrl !== undefined) heroImage.imageUrl = imageUrl;
    if (mobileImageUrl !== undefined) heroImage.mobileImageUrl = mobileImageUrl;
    if (title !== undefined) heroImage.title = title;
    if (subtitle !== undefined) heroImage.subtitle = subtitle;
    if (isActive !== undefined) heroImage.isActive = isActive;
    if (order !== undefined) heroImage.order = order;

    await heroImage.save();

    res.status(200).json({
      success: true,
      message: "Hero image updated successfully",
      code: "HERO_IMAGE_UPDATED",
      data: {
        heroImage,
      },
    });
  } catch (error) {
    console.error("Update hero image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update hero image",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Toggle hero image active status
 * @route PATCH /api/admin/site-settings/hero-images/:id/toggle
 * @access Private (Admin)
 */
const toggleHeroImage = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    const heroImage = await HeroImage.findById(id);

    if (!heroImage) {
      return res.status(404).json({
        success: false,
        message: "Hero image not found",
        code: "NOT_FOUND",
      });
    }

    heroImage.isActive = !heroImage.isActive;
    await heroImage.save();

    res.status(200).json({
      success: true,
      message: `Hero image ${heroImage.isActive ? "activated" : "deactivated"} successfully`,
      code: "HERO_IMAGE_TOGGLED",
      data: {
        heroImage,
      },
    });
  } catch (error) {
    console.error("Toggle hero image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle hero image",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Delete a hero image
 * @route DELETE /api/admin/site-settings/hero-images/:id
 * @access Private (Admin)
 */
const deleteHeroImage = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    const heroImage = await HeroImage.findByIdAndDelete(id);

    if (!heroImage) {
      return res.status(404).json({
        success: false,
        message: "Hero image not found",
        code: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hero image deleted successfully",
      code: "HERO_IMAGE_DELETED",
      data: {
        heroImage,
      },
    });
  } catch (error) {
    console.error("Delete hero image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete hero image",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== STICKY BANNERS ====================

/**
 * @desc Get all sticky banners
 * @route GET /api/admin/site-settings/sticky-banners
 * @access Private (Admin)
 */
const getAllStickyBanners = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const stickyBanners = await StickyBanner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Sticky banners retrieved successfully",
      code: "STICKY_BANNERS_RETRIEVED",
      data: {
        stickyBanners,
        total: stickyBanners.length,
      },
    });
  } catch (error) {
    console.error("Get sticky banners error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sticky banners",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Get active sticky banner (public)
 * @route GET /api/site-settings/sticky-banner
 * @access Public
 */
const getActiveStickyBanner = async (req, res) => {
  try {
    const stickyBanner = await StickyBanner.findOne({ isActive: true });

    res.status(200).json({
      success: true,
      message: stickyBanner ? "Active sticky banner retrieved successfully" : "No active sticky banner",
      code: "STICKY_BANNER_RETRIEVED",
      data: {
        stickyBanner: stickyBanner || null,
      },
    });
  } catch (error) {
    console.error("Get active sticky banner error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sticky banner",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Create a sticky banner
 * @route POST /api/admin/site-settings/sticky-banners
 * @access Private (Admin)
 */
const createStickyBanner = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { heading, linkText, linkUrl, isActive } = req.body;

    if (!heading) {
      return res.status(400).json({
        success: false,
        message: "Heading is required",
        code: "VALIDATION_ERROR",
      });
    }

    // If this banner is being set as active, deactivate all others
    if (isActive) {
      await StickyBanner.updateMany({}, { isActive: false });
    }

    const stickyBanner = new StickyBanner({
      heading,
      linkText: linkText || "",
      linkUrl: linkUrl || "",
      isActive: isActive || false,
    });

    await stickyBanner.save();

    res.status(201).json({
      success: true,
      message: "Sticky banner created successfully",
      code: "STICKY_BANNER_CREATED",
      data: {
        stickyBanner,
      },
    });
  } catch (error) {
    console.error("Create sticky banner error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sticky banner",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Update a sticky banner
 * @route PUT /api/admin/site-settings/sticky-banners/:id
 * @access Private (Admin)
 */
const updateStickyBanner = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;
    const { heading, linkText, linkUrl, isActive } = req.body;

    const stickyBanner = await StickyBanner.findById(id);

    if (!stickyBanner) {
      return res.status(404).json({
        success: false,
        message: "Sticky banner not found",
        code: "NOT_FOUND",
      });
    }

    // If this banner is being set as active, deactivate all others
    if (isActive && !stickyBanner.isActive) {
      await StickyBanner.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    if (heading !== undefined) stickyBanner.heading = heading;
    if (linkText !== undefined) stickyBanner.linkText = linkText;
    if (linkUrl !== undefined) stickyBanner.linkUrl = linkUrl;
    if (isActive !== undefined) stickyBanner.isActive = isActive;

    await stickyBanner.save();

    res.status(200).json({
      success: true,
      message: "Sticky banner updated successfully",
      code: "STICKY_BANNER_UPDATED",
      data: {
        stickyBanner,
      },
    });
  } catch (error) {
    console.error("Update sticky banner error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update sticky banner",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Toggle sticky banner active status (only one can be active)
 * @route PATCH /api/admin/site-settings/sticky-banners/:id/toggle
 * @access Private (Admin)
 */
const toggleStickyBanner = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    const stickyBanner = await StickyBanner.findById(id);

    if (!stickyBanner) {
      return res.status(404).json({
        success: false,
        message: "Sticky banner not found",
        code: "NOT_FOUND",
      });
    }

    // If activating this banner, deactivate all others
    if (!stickyBanner.isActive) {
      await StickyBanner.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    stickyBanner.isActive = !stickyBanner.isActive;
    await stickyBanner.save();

    res.status(200).json({
      success: true,
      message: `Sticky banner ${stickyBanner.isActive ? "activated" : "deactivated"} successfully`,
      code: "STICKY_BANNER_TOGGLED",
      data: {
        stickyBanner,
      },
    });
  } catch (error) {
    console.error("Toggle sticky banner error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle sticky banner",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Delete a sticky banner
 * @route DELETE /api/admin/site-settings/sticky-banners/:id
 * @access Private (Admin)
 */
const deleteStickyBanner = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    const stickyBanner = await StickyBanner.findByIdAndDelete(id);

    if (!stickyBanner) {
      return res.status(404).json({
        success: false,
        message: "Sticky banner not found",
        code: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sticky banner deleted successfully",
      code: "STICKY_BANNER_DELETED",
      data: {
        stickyBanner,
      },
    });
  } catch (error) {
    console.error("Delete sticky banner error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete sticky banner",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  // Hero Images
  getAllHeroImages,
  getActiveHeroImages,
  createHeroImage,
  updateHeroImage,
  toggleHeroImage,
  deleteHeroImage,
  // Sticky Banners
  getAllStickyBanners,
  getActiveStickyBanner,
  createStickyBanner,
  updateStickyBanner,
  toggleStickyBanner,
  deleteStickyBanner,
};
