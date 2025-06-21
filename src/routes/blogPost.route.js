import { Router } from "express";
const router = Router();
import upload from "../libs/multer.lib.js";
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
  updatePostSchema
} from "../schemas/blogPost.schema.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import remapParamToQuery from "../middlewares/remap.middleware.js";
import { USER_TYPES } from "../configs/constants.config.js";


//create post
router.post("/", authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), validate({ body: createPostSchema }), upload.single("featuredImage"), createPostCtrl);

//get all posts with selected queries
router.get("/", optionalAuth, validate({
  query: getAllPostsSchema
}), getAllPostsCtrl);

//get post by id
router.get("/:id", authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), validate({
  params: getPostSchema
}), remapParamToQuery("id"), getPostCtrl);

//get post by slug
router.get("/slug/:slug", optionalAuth, validate({
  params: getPostSchema
}), remapParamToQuery("slug"), getPostCtrl);

//update post
router.patch("/:id", authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), validate({
  body: updatePostSchema
}), upload.single("featuredImage"), updatePostCtrl);

//delete post
router.delete("/:id", authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), deletePostCtrl);


export default router;