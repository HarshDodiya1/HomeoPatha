/**
 * Cloudflare R2 storage helper.
 *
 * R2 exposes an S3-compatible API, so we talk to it with the AWS S3 SDK
 * pointed at the account-specific R2 endpoint. Credentials stay server-side.
 */
const crypto = require("crypto");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const config = require("../config/config.js");

const { accountId, accessKeyId, secretAccessKey, bucket, endpoint, publicBaseUrl } =
  config.r2;

let client = null;

/**
 * Lazily create (and memoize) the S3 client for R2.
 * Throws a clear error if the required env vars are missing.
 */
function getClient() {
  if (client) return client;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET in the server environment.",
    );
  }

  client = new S3Client({
    region: "auto",
    endpoint: endpoint || `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}

// Restrict uploads to a known set of folders so keys stay tidy and predictable.
const ALLOWED_FOLDERS = new Set([
  "products",
  "doctors",
  "blogs",
  "specializations",
  "hero",
  "misc",
]);

function normalizeFolder(folder) {
  const clean = String(folder || "misc")
    .trim()
    .toLowerCase();
  return ALLOWED_FOLDERS.has(clean) ? clean : "misc";
}

/**
 * Build a unique, collision-proof object key.
 * e.g. "products/8f3c…-1699999999.jpg"
 */
function buildKey(folder, originalName, mimeType) {
  const ext =
    (path.extname(originalName || "") || extFromMime(mimeType) || "").toLowerCase();
  const unique = crypto.randomBytes(16).toString("hex");
  return `${normalizeFolder(folder)}/${unique}${ext}`;
}

function extFromMime(mimeType) {
  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
  };
  return map[mimeType] || "";
}

/**
 * Upload a buffer to R2 and return its public URL.
 *
 * @param {Object} params
 * @param {Buffer} params.buffer      file contents
 * @param {string} params.mimeType    content type
 * @param {string} [params.folder]    logical folder (products/doctors/…)
 * @param {string} [params.originalName] original filename (for extension)
 * @param {string} [params.key]       explicit key (overrides folder-based key)
 * @returns {Promise<{ url: string, key: string }>}
 */
async function uploadBuffer({ buffer, mimeType, folder, originalName, key }) {
  if (!publicBaseUrl) {
    throw new Error(
      "R2_PUBLIC_BASE_URL is not configured. Set it to your bucket's public URL (e.g. https://pub-xxxx.r2.dev).",
    );
  }

  const objectKey = key || buildKey(folder, originalName, mimeType);

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: mimeType || "application/octet-stream",
    }),
  );

  const base = publicBaseUrl.replace(/\/+$/, "");
  return { url: `${base}/${objectKey}`, key: objectKey };
}

module.exports = {
  uploadBuffer,
  buildKey,
  normalizeFolder,
  ALLOWED_FOLDERS,
};
