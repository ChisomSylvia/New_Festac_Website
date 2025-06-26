import { Router } from "express";
const router = Router();
import { upload } from "../libs/multer.lib.js";
import {
  createPostCtrl,
  getAllPostsCtrl,
  getPostCtrl,
  updatePostCtrl,
  deletePostCtrl,
} from "../controllers/blogPost.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createPostSchema,
  getAllPostsSchema,
  getPostSchema,
  updatePostSchema,
  deletePostSchema,
} from "../schemas/blogPost.schema.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
// import remapParamToQuery from "../middlewares/remap.middleware.js";
import { USER_TYPES } from "../configs/constants.config.js";


//create post
router.post(
  "/",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  upload.single("featuredImage"),
  validate({
    body: createPostSchema,
  }),
  createPostCtrl
);


//get all posts with selected queries
router.get(
  "/",
  optionalAuth,
  validate({
    query: getAllPostsSchema,
  }),
  getAllPostsCtrl
);


//get post by id (admin access only)
router.get(
  "/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  validate({
    params: getPostSchema,
  }),
  getPostCtrl
);

//get post by slug (public access)
router.get(
  "/slug/:slug",
  optionalAuth,
  validate({
    params: getPostSchema,
  }),
  getPostCtrl
);


//update post
router.patch(
  "/update/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  upload.single("featuredImage"),
  validate({
    body: updatePostSchema,
  }),
  updatePostCtrl
);

//delete post
router.delete(
  "/delete/:id",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  validate({
    params: deletePostSchema,
  }),
  deletePostCtrl
);

export default router;