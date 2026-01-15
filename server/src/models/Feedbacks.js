const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: true,
      trim: true, // prevent layout breaking
    },

    userName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    userRole: {
      type: String,
      trim: true,
      maxlength: 100, // e.g. "Founder @ XYZ", "Customer", etc.
    },

    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    socialLinks: {
      whatsapp: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      facebook: {
        type: String,
        trim: true,
      },
    },
    
    isPublished: {
      type: Boolean,
      default: true, // admin-controlled visibility
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
