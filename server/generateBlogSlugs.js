/**
 * Migration script to generate slugs for existing blogs
 * Run this script once after adding the slug field to the Blog model
 * 
 * Usage: node generateBlogSlugs.js
 */

const mongoose = require('mongoose');
const Blog = require('./src/models/Blog.js');
const config = require('./src/config/config.js');

// Function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const migrateBlogs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.dbURL);
    console.log('Connected to MongoDB');

    // Find all blogs without slugs or with empty slugs
    const blogsWithoutSlugs = await Blog.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });

    console.log(`Found ${blogsWithoutSlugs.length} blogs without slugs`);

    for (const blog of blogsWithoutSlugs) {
      if (!blog.title) {
        console.log(`Skipping blog ${blog._id} - no title`);
        continue;
      }

      let baseSlug = generateSlug(blog.title);
      let slug = baseSlug;
      let counter = 1;

      // Check for existing slugs and make unique if needed
      while (true) {
        const existingBlog = await Blog.findOne({
          slug: slug,
          _id: { $ne: blog._id }
        });

        if (!existingBlog) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Update the blog with the new slug
      await Blog.updateOne(
        { _id: blog._id },
        { $set: { slug: slug } }
      );

      console.log(`Updated blog "${blog.title}" with slug: ${slug}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateBlogs();
