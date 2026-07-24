/*
 * Read-only image storage audit.
 *
 * Usage: node scripts/auditImageStorage.js
 *
 * Reports every host used by image fields and exits with a non-zero code when
 * a Cloudinary URL remains. It intentionally never updates the database.
 */
const mongoose = require("mongoose");
const config = require("../src/config/config.js");
const Product = require("../src/models/Product.js");
const Doctor = require("../src/models/Doctor.js");
const Blog = require("../src/models/Blog.js");
const Specialization = require("../src/models/Specialization.js");
const { HeroImage } = require("../src/models/SiteSettings.js");
const Order = require("../src/models/Order.js");

const hosts = new Map();

function addImageUrl(url, field) {
  if (!url || typeof url !== "string") return;

  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    host = url.startsWith("/") ? "local-path" : "invalid-url";
  }

  const entry = hosts.get(host) || { count: 0, fields: new Set() };
  entry.count += 1;
  entry.fields.add(field);
  hosts.set(host, entry);
}

async function main() {
  if (!config.dbURL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await mongoose.connect(config.dbURL);

  const [products, doctors, blogs, specializations, heroImages, orders] =
    await Promise.all([
      Product.find({}, "images").lean(),
      Doctor.find({}, "images").lean(),
      Blog.find({}, "coverImage").lean(),
      Specialization.find({}, "imageUrl").lean(),
      HeroImage.find({}, "imageUrl mobileImageUrl").lean(),
      Order.find({}, "orderItems.image").lean(),
    ]);

  products.forEach((item) =>
    (item.images || []).forEach((url) => addImageUrl(url, "products.images")),
  );
  doctors.forEach((item) =>
    (item.images || []).forEach((url) => addImageUrl(url, "doctors.images")),
  );
  blogs.forEach((item) => addImageUrl(item.coverImage, "blogs.coverImage"));
  specializations.forEach((item) =>
    addImageUrl(item.imageUrl, "specializations.imageUrl"),
  );
  heroImages.forEach((item) => {
    addImageUrl(item.imageUrl, "heroImages.imageUrl");
    addImageUrl(item.mobileImageUrl, "heroImages.mobileImageUrl");
  });
  orders.forEach((item) =>
    (item.orderItems || []).forEach((entry) =>
      addImageUrl(entry.image, "orders.orderItems.image"),
    ),
  );

  const hostSummary = [...hosts.entries()]
    .map(([host, entry]) => ({
      host,
      count: entry.count,
      fields: [...entry.fields].sort(),
    }))
    .sort((a, b) => a.host.localeCompare(b.host));
  const cloudinaryCount = hostSummary
    .filter(({ host }) => host === "cloudinary.com" || host.endsWith(".cloudinary.com"))
    .reduce((total, { count }) => total + count, 0);

  console.log(
    JSON.stringify(
      {
        documents: {
          products: products.length,
          doctors: doctors.length,
          blogs: blogs.length,
          specializations: specializations.length,
          heroImages: heroImages.length,
          orders: orders.length,
        },
        hosts: hostSummary,
        cloudinaryCount,
      },
      null,
      2,
    ),
  );

  if (cloudinaryCount > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(`Image storage audit failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
