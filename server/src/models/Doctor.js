const mongoose = require("mongoose");

// const timeSlotSchema = new mongoose.Schema({
//   day: {
//     type: String,
//     enum: [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ],
//     required: true,
//   },
//   startTime: { type: String, required: true },
//   endTime: { type: String, required: true },
//   isAvailable: { type: Boolean, default: true },
// });

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    about: { type: String },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", doctorSchema);
