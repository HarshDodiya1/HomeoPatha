const express = require("express");
const multer = require("multer");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const { uploadSingle, uploadMultiple } = require("../controllers/uploadController.js");

// Image upload is an administrative write operation. A normal authenticated
// patient must never be able to consume storage or create public objects.
const requireSuperadmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Superadmin access is required to upload images.",
      code: "ADMIN_ACCESS_REQUIRED",
    });
  }

  next();
};

// Keep files in memory; we stream the buffer straight to R2 (no local disk).
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Only images are allowed.`));
    }
  },
});

// Surface multer errors (size/type) as clean 400s instead of the generic handler.
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed.",
      });
    }
    next();
  });
};

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a single image to R2 (Admin only)
 *     tags:
 *       - Upload
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: Logical folder (products, doctors, blogs, specializations, hero)
 *     responses:
 *       201:
 *         description: Image uploaded; returns public URL
 *       400:
 *         description: No/invalid file
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  requireSuperadmin,
  handleUpload(upload.single("file")),
  uploadSingle,
);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple images to R2 (Admin only)
 *     tags:
 *       - Upload
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       201:
 *         description: Images uploaded; returns public URLs
 */
router.post(
  "/multiple",
  authMiddleware,
  requireSuperadmin,
  handleUpload(upload.array("files", 10)),
  uploadMultiple,
);

module.exports = router;
