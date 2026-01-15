const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    summary: {
      type: String
    },
    content: {
      type: String
    },
    coverImage: {
      type: String
    },
    tags: [
      {
        type: String,
        lowercase: true
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    published: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

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

// Pre-save hook to auto-generate slug from title
blogSchema.pre('save', async function(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for existing slugs and make unique if needed
    while (true) {
      const existingBlog = await mongoose.model('Blog').findOne({ 
        slug: slug, 
        _id: { $ne: this._id } 
      });
      
      if (!existingBlog) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema)
