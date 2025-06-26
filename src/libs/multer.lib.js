import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.lib.js";
import { normalizeTitle } from "../utils/blogPost.util.js";
import BlogPostModel from "../models/blogPost.model.js";
import PropertyModel from "../models/property.model.js";

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

const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let title = req.body?.title;

    // Fallback: title not sent, try to fetch from DB using ID in req.params
    if (!title && req.params?.id) {
      try {
        const property = await PropertyModel.findById(req.params.id);
        title = property?.title || "untitled";
      } catch (err) {
        console.warn("Could not fetch title for Cloudinary public_id:", err);
        title = "untitled";
      }
    }

    //initialize uploadbatch ID counter per request
    if (!req._uploadSessionId) {
      req._normalizedTitle = normalizeTitle(title);
      req._uploadSessionId = Date.now();
      req.fileIndex = 0;
    }

    const index = req.fileIndex++;
    const publicId = `property-${req._normalizedTitle}-${index}`;

    return {
      folder: "festac-property-images",
      public_id: publicId,
      overwrite: true,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
    };
  },
});

const propertyUpload = multer({
  storage: propertyStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .jpeg, .png, or .webp images are allowed."));
  },
})

export { upload, propertyUpload };
