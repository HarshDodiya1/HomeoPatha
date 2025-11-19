const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "doctor", "patient"],
      default: "patient",
    },
    addresses: [addressSchema],
  },
  { timestamps: true },
);


module.exports = mongoose.model("User", userSchema);
