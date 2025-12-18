const mongoose = require("mongoose");

const heroImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const stickyBannerSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    linkText: {
      type: String,
      default: "",
    },
    linkUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const HeroImage = mongoose.model("HeroImage", heroImageSchema);
const StickyBanner = mongoose.model("StickyBanner", stickyBannerSchema);

module.exports = { HeroImage, StickyBanner };
