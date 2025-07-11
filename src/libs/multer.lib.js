import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.lib.js";
import { normalizeTitle } from "../utils/utils.js";
import BlogPostModel from "../models/blogPost.model.js";
import UserModel from "../models/user.model.js";

//profile image upload
const profileImageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
   let name = req.body?.name;

    //fallback: name not sent, try to fetch from DB using ID in req.params
    if (!name && req.params?.id) {
      try {
        const user = await UserModel.findById(req.params.id);
        name = user?.name || "untitled";
      } catch (err) {
        console.warn("Could not fetch name for Cloudinary public_id:", err);
        name = "untitled";
      }
    }

    const nameLower = normalizeTitle(name);

    return {
      folder: "festac-profile-images",
      public_id: `${nameLower}-profile-image`,
      overwrite: false,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [
        {
          quality: "auto",
        },
        {
          fetch_format: "auto",
        },
      ],
    };
  },
});

const profileImageUpload = multer({
  storage: profileImageStorage,
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

//blog image upload
const blogStorage = new CloudinaryStorage({
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
      overwrite: false,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [
        {
          quality: "auto",
        },
        {
          fetch_format: "auto",
        },
      ],
    };
  },
});

const blogUpload = multer({
  storage: blogStorage,
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

//property storage with non dynamic temporary public IDs
const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    //generate or reuse base ID for this entire request
    if (!req.uploadSessionId) {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      req.uploadSessionId = `property-${timestamp}-${randomId}`;
    }

    const fileIndex = req.fileIndex || 0;

    //increment file index for this request
    req.fileIndex = (req.fileIndex || 0) + 1;

    //create temp public ID using the consistent base
    const publicId = `temp-${req.uploadSessionId}-${fileIndex}`;

    return {
      folder: "festac-property-images",
      public_id: publicId,
      overwrite: false,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        {
          quality: "auto",
        },
        {
          fetch_format: "auto",
        },
      ],
    };
  },
});

const propertyUpload = multer({
  storage: propertyStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .jpeg, .png, or .webp images are allowed."));
  },
});


export { profileImageUpload, blogUpload, propertyUpload };