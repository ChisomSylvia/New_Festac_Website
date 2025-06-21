import { Schema, model } from "mongoose";
import { TAGS, STATUS } from "../configs/constants.config.js";

const blogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    titleLower: {
      type: String,
      required: true,
      unique: true,
      // index: {
      //   name: "titleLower_index"
      // },
    },

    slug: {
      type: String,
      unique: true,
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

    // author: {
    //   type: Schema.Types.ObjectId,
    //   ref: "user",
    //   required: true,
    // },

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
      type: String,
      default: 1,
    },

    // views: {
    //   type: Number,
    //   default: 0,
    // },

  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// blogPostSchema.index({
//   titleLower: 1
// });

blogPostSchema.index({ status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ status: 1, tags: 1, publishedAt: -1 });

blogPostSchema.index({
  title: "text",
  excerpt: "text",
  content: "text"
})

const BlogPostModel = new model("blog-post", blogPostSchema);
export default BlogPostModel;