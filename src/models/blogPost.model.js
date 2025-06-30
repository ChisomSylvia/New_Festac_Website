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

    originalPublicIdBase: {
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

    // author: {
    //   type: Schema.Types.ObjectId,
    //   ref: "user",
    //   required: true,
    // },

    // tags: [
    //   {
    //     type: String,
    //     enum: Object.values(TAGS),
    //     default: null,
    //   },
    // ],

    // views: {
    //   type: Number,
    //   default: 0,
    // },
    
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
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
