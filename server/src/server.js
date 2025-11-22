const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/config.js");
const app = express();
dotenv.config();

// Enhanced CORS configuration for separate frontend/backend setup
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend port
      "http://localhost:4000", // Admin frontend port
      config.cors_origin1, // Your existing config
      config.cors_origin2, // Your existing config
    ].filter(Boolean), // Remove undefined values
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200, // Support legacy browsers
  }),
);


app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const connectDB = require("./config/db.js");
connectDB();

// Swagger Documentation
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger.js");

// Imported Routes
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const doctorRoutes = require("./routes/doctorRoutes.js");
const appointmentRoutes = require("./routes/appointmentRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const adminDoctorRoutes = require("./routes/adminRoutes/doctorRoutes.js");
const adminUserRoutes = require("./routes/adminRoutes/userRoutes.js");
const adminProductRoutes = require("./routes/adminRoutes/productRoutes.js");
const adminContactRoutes = require("./routes/adminRoutes/contactRoutes.js");
const adminAppointmentRoutes = require("./routes/adminRoutes/appointmentRoutes.js");
const adminOrderRoutes = require("./routes/adminRoutes/orderRoutes.js");

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
  },
  customCss: `.topbar { display: none }`,
  customCssUrl: "",
  customJs: `
    window.onload = function() {
      // Add download link to the page
      const downloadLink = document.createElement('a');
      downloadLink.href = '/api-docs.json';
      downloadLink.download = 'openapi.json';
      downloadLink.className = 'btn authorize unlocked';
      downloadLink.style.cssText = 'position: absolute; top: 20px; right: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; cursor: pointer; z-index: 1000;';
      downloadLink.textContent = '⬇️ Download OpenAPI JSON';
      
      const topbar = document.querySelector('.topbar-inner');
      if (topbar && !document.getElementById('download-openapi')) {
        downloadLink.id = 'download-openapi';
        topbar.parentElement.style.position = 'relative';
        topbar.parentElement.appendChild(downloadLink);
      }
    };
  `,
}));

// OpenAPI JSON endpoint - Access at http://localhost:5000/api-docs.json
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpecs);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/products", productRoutes); // Contains cart routes at /api/products/cart
app.use("/api/orders", orderRoutes);
app.use("/api/admin/doctors", adminDoctorRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/contacts", adminContactRoutes);
app.use("/api/admin/appointments", adminAppointmentRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Backend APIs of HomeoPatha",
    creator: "Harsh Dodiya | Het Saraiya",
    GitHub: config.github1 || "Harsh Dodiya",
    Github: config.github2 || "Het Saraiya",
    apiDocs: "/api",
    status: "Running",
    timestamp: new Date().toISOString(),
  });
});

// Add a health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`⚙  Server is running at port: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
