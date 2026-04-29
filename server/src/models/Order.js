const mongoose = require("mongoose");
const Counter = require("./Counter.js");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  title: { type: String, required: true },
  hsnCode: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: { type: String },
  cgstRate: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },
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
    billingDetails: {
      accName: { type: String },
      accNo: { type: String },
      ifsc: { type: String },
      branch: { type: String },
      gstin: { type: String },
    },
    shippingCharges: { type: Number, default: 0 },
    cgstRate: { type: Number, default: 0 },
    sgstRate: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "payment_failed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    invoiceDate: { type: Date },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    adminNotes: { type: String },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

async function generateInvoiceNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "invoiceNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `HP-${String(counter.seq).padStart(6, "0")}`;
}

orderSchema.pre("validate", async function assignInvoiceNumber(next) {
  if (this.invoiceNumber) {
    return next();
  }

  try {
    this.invoiceNumber = await generateInvoiceNumber();
    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("Order", orderSchema);
