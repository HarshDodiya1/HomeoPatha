const mongoose = require("mongoose");

const appointmentQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: ["text", "textarea", "select", "checkbox", "radio", "date", "number"],
      required: true,
      default: "text",
    },
    options: {
      type: [String],
      default: [],
      // Required for select, checkbox, and radio types
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    specializationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
      default: null,
      // null means this question applies to all specializations
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
appointmentQuestionSchema.index({ specializationId: 1, isActive: 1 });
appointmentQuestionSchema.index({ order: 1 });

module.exports = mongoose.model("AppointmentQuestion", appointmentQuestionSchema);
