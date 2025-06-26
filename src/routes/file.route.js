import {
  Router
} from "express";
const router = Router();
import { uploadFile, deleteFile } from "../controllers/file.controller.js";
import { upload } from "../libs/multer.lib.js";

//upload featured image
router.post("/upload", upload.single("image"), uploadFile);

// //update featured image
// router.patch("/upload", upload.single("image"), updateFeaturedImage);

//delete featured image
router.delete("/delete/:public_id", deleteFile);

export default router;