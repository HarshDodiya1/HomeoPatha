const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("./src/models/User.js");
const Doctor = require("./src/models/Doctor.js");
const Product = require("./src/models/Product.js");
const Order = require("./src/models/Order.js");
const Appointment = require("./src/models/Appointment.js");
const ContactMessage = require("./src/models/ContactMessage.js");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

const cleanDatabase = async () => {
  try {
    console.log("⚠️  Starting database cleanup...\n");

    // ===========================================================
    // COMMENT OUT LINES BELOW TO PREVENT DELETING SPECIFIC DATA
    // ===========================================================

    // 1. Contact Messages
    console.log("🗑️  Deleting Contact Messages...");
    await ContactMessage.deleteMany({});

    // 2. Orders
    console.log("🗑️  Deleting Orders...");
    await Order.deleteMany({});

    // 3. Appointments
    console.log("🗑️  Deleting Appointments...");
    await Appointment.deleteMany({});

    // 4. Products
    console.log("🗑️  Deleting Products...");
    await Product.deleteMany({});

    // 5. Doctors (Deletes the Doctor Profile only)
    console.log("🗑️  Deleting Doctor Profiles...");
    await Doctor.deleteMany({});

    // 6. Users (Deletes Patients, Admins, and User accounts for Doctors)
    console.log("🗑️  Deleting Users...");
    await User.deleteMany({});

    // ===========================================================

    console.log("\n✨ Database cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
};

// Run cleanup
connectDB().then(cleanDatabase);
