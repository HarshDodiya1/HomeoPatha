const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    duration: { type: Number, default: 30 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"],
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
    notes: { type: String },
    prescription: { type: String },
    cancelledBy: { type: String, enum: ["patient", "doctor", "admin"] },
    cancelReason: { type: String },
  },
  { timestamps: true },
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
