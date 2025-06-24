import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.lib.js";
import { normalizeTitle } from "../utils/blogPost.util.js";
import BlogPostModel from "../models/blogPost.model.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let title = req.body?.title;

    // Fallback: title not sent, try to fetch from DB using ID in req.params
    if (!title && req.params?.id) {
      try {
        const post = await BlogPostModel.findById(req.params.id);
        title = post?.title || "untitled";
      } catch (err) {
        console.warn("Could not fetch title for Cloudinary public_id:", err);
        title = "untitled";
      }
    }

    const titleLower = normalizeTitle(title);

    return {
      folder: "festac-featured-images",
      public_id: `blog-${titleLower}`,
      overwrite: true,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    };
  },
});

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const title = req.body.title || "untitled";
//     const titleLower = normalizeTitle(title);

//     return {
//       folder: "festac-featured-images",
//       public_id: `blog-${titleLower}`,
//       overwrite: true,
//       allowed_formats: ["jpg", "png", "jpeg", "webp"],
//       transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
//     };
//   },
// });

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .png, or .webp images are allowed."));
    }
  },
});

export default upload;
