const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    summary: {
      type: String
    },
    content: {
      type: String
    },
    coverImage: {
      type: String
    },
    tags: [
      {
        type: String,
        lowercase: true
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    published: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema)
