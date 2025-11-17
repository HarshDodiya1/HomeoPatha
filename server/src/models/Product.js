const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    badge: { type: String },
    rating: { type: Number, default: 0 },
    oldPrice: { type: Number },
    currentPrice: { type: Number, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
