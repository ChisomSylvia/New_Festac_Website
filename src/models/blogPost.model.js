import { Schema, model } from "mongoose";
import { TAGS, STATUS } from "../utils/blog.util.js";

const blogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    content: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    featuredImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    tags: [
      {
        type: String,
        enum: Object.values(TAGS),
        default: null,
      },
    ],

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
      type: Number,
      default: 1,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const BlogPostModel = new model("blog-post", blogPostSchema);
export default BlogPostModel;