const mongoose = require("mongoose");

const questionResponseSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppointmentQuestion",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specializationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    consultationFee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
    },
    questionResponses: {
      type: [questionResponseSchema],
      default: [],
    },
    prescription: { type: String },
    adminNotes: { type: String },
    cancelledBy: { type: String, enum: ["patient", "admin"] },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

appointmentSchema.index({ specializationId: 1, createdAt: -1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
