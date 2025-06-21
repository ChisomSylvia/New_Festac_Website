import {
  CloudinaryStorage
} from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.lib.js";
import {
  normalizeTitle
} from "../utils/blogPost.util.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const title = req.body.title || "untitled";
    const titleLower = normalizeTitle(title);

    return {
      folder: "festac-featured-images",
      public_id: `blog-${titleLower}`,
      overwrite: true,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{
        quality: "auto"
      }, {
        fetch_format: "auto"
      }]
    }
  }
});


const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  } // 5MB
});

export default upload;