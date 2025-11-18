const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HomeoPatha Backend API",
      description:
        "[openapi.json](/api-docs.json)",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development Server",
      },
      {
        url: "https://api.homeopatha.com",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT authentication token",
        },
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token in cookie",
        },
      },
      schemas: {
        // Error Response Schemas
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            code: { type: "string", example: "VALIDATION_ERROR" },
            errors: {
              type: "object",
              additionalProperties: { type: "string" },
            },
          },
        },
        NotFoundError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Resource not found" },
            code: { type: "string", example: "NOT_FOUND" },
          },
        },
        UnauthorizedError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Authentication failed" },
            code: { type: "string", example: "UNAUTHORIZED" },
          },
        },

        // User/Auth Schemas
        User: {
          type: "object",
          properties: {
            id: { type: "string", description: "User ID" },
            fullName: { type: "string", description: "Full name" },
            email: { type: "string", format: "email" },
            phoneNumber: { type: "string", description: "Phone number" },
            role: {
              type: "string",
              enum: ["superadmin", "doctor", "patient"],
              description: "User role",
            },
            addresses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  addressLine1: { type: "string" },
                  addressLine2: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  pincode: { type: "string" },
                  isDefault: { type: "boolean" },
                },
              },
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "id",
            "fullName",
            "email",
            "phoneNumber",
            "role",
            "isActive",
          ],
        },

        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            code: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string", description: "JWT token" },
              },
            },
          },
        },

        // Doctor Schemas
        Doctor: {
          type: "object",
          properties: {
            id: { type: "string", description: "Doctor ID" },
            userId: { type: "string", description: "Associated User ID" },
            specialization: { type: "string" },
            qualification: { type: "string" },
            experience: { type: "number", description: "Years of experience" },
            consultationFee: { type: "number" },
            about: { type: "string" },
            rating: { type: "number", format: "float" },
            totalRatings: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Order Schemas
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            orderItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  title: { type: "string" },
                  quantity: { type: "number" },
                  price: { type: "number" },
                  image: { type: "string" },
                },
              },
            },
            shippingAddress: {
              type: "object",
              properties: {
                addressLine1: { type: "string" },
                addressLine2: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                pincode: { type: "string" },
              },
            },
            totalAmount: { type: "number" },
            orderStatus: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
            paymentStatus: {
              type: "string",
              enum: ["pending", "completed", "failed", "refunded"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Appointment Schemas
        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            patientId: { type: "string" },
            doctorId: { type: "string" },
            appointmentDate: { type: "string", format: "date-time" },
            appointmentTime: { type: "string" },
            duration: { type: "number", description: "Duration in minutes" },
            reason: { type: "string" },
            status: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "completed",
                "cancelled",
                "rescheduled",
              ],
            },
            consultationFee: { type: "number" },
            paymentStatus: {
              type: "string",
              enum: ["pending", "completed", "failed", "refunded"],
            },
            notes: { type: "string" },
            prescription: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Pagination Schemas
        PaginationMeta: {
          type: "object",
          properties: {
            currentPage: { type: "number" },
            totalPages: { type: "number" },
            totalItems: { type: "number" },
            itemsPerPage: { type: "number" },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/authRoutes.js",
    "./src/routes/userRoutes.js",
    "./src/routes/doctorRoutes.js",
  ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
