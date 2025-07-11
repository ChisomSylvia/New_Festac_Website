import { Schema, model } from "mongoose";
import { STATUS } from "../configs/constants.config.js";

const blogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    publicIdBase: {
      type: String,
      required: true,
    },

    titleLower: {
      type: String,
      required: true,
      unique: true,
    },

    slug: {
      type: String,
      // unique: true,
    },

    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    featuredImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.DRAFT,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    readTime: {
      type: String,
      default: "1 min read",
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  }
);

blogPostSchema.index({ status: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });

blogPostSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
});

const BlogPostModel = new model("blog-post", blogPostSchema);
export default BlogPostModel;