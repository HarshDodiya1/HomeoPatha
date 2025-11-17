const jwt = require("jsonwebtoken");
const config = require("../config/config.js");

/**
 * Middleware to verify JWT token and authenticate user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing. Please login first.",
        code: "NO_TOKEN",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token. Please login again.",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTH_ERROR",
    });
  }
};

module.exports = authMiddleware;
