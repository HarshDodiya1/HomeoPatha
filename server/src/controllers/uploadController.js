/**
 * Upload controller
 * Receives image files from the admin panel and stores them in Cloudflare R2,
 * returning the public URL(s) that get persisted in the database.
 */
const { uploadBuffer } = require("../utils/r2.js");

/**
 * POST /api/upload
 * multipart/form-data with a single "file" field and optional "folder" field.
 * Returns: { success, url, key }
 */
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided. Attach a file under the 'file' field.",
      });
    }

    const folder = req.body?.folder;
    const { url, key } = await uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      folder,
    });

    return res.status(201).json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error("R2 upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image.",
    });
  }
};

/**
 * POST /api/upload/multiple
 * multipart/form-data with a "files" field (up to 10) and optional "folder".
 * Returns: { success, urls: string[], items: [{ url, key }] }
 */
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided. Attach files under the 'files' field.",
      });
    }

    const folder = req.body?.folder;
    const items = await Promise.all(
      req.files.map((file) =>
        uploadBuffer({
          buffer: file.buffer,
          mimeType: file.mimetype,
          originalName: file.originalname,
          folder,
        }),
      ),
    );

    return res.status(201).json({
      success: true,
      urls: items.map((i) => i.url),
      items,
    });
  } catch (error) {
    console.error("R2 upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload images.",
    });
  }
};

module.exports = { uploadSingle, uploadMultiple };
