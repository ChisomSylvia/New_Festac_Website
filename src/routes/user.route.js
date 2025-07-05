import { Router } from "express";
const router = Router();
import {
  getAllUsersCtrl,
  getUserCtrl,
  updateUserCtrl,
  deleteUserCtrl,
} from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { updateUserSchema } from "../schemas/user.schema.js";
import { objectIdSchema } from "../schemas/schemas.js";
import { USER_TYPES } from "../configs/constants.config.js";
import { profileImageUpload } from "../libs/multer.lib.js";

//get all users
router.get(
  "/",
  authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]),
  getAllUsersCtrl
);

//get a user
router.get(
  "/:id",
  authenticate([]),
  validate({ params: objectIdSchema }),
  getUserCtrl
);

//update a user
router.patch(
  "/update/:id",
  authenticate([]),
  profileImageUpload.single("profileImage"),
  validate({
    params: objectIdSchema,
    body: updateUserSchema,
  }),
  updateUserCtrl
);

//delete user
router.delete(
  "/delete/:id",
  authenticate([]),
  validate({ params: objectIdSchema }),
  deleteUserCtrl
);

export default router;