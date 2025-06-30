import {
  Router
} from "express";
const router = Router();
import { uploadFile, deleteFile } from "../controllers/file.controller.js";
import { blogUpload } from "../libs/multer.lib.js";

//blogUpload featured image
router.post("/upload", blogUpload.single("image"), uploadFile);

// //update featured image
// router.patch("/upload", blogUpload.single("image"), updateFeaturedImage);

//delete featured image
router.delete("/delete/:public_id", deleteFile);

export default router;