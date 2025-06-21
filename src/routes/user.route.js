import { Router } from "express";
const router = Router();
import {
  getAllUsersCtrl,
  getUserCtrl,
  updateUserCtrl,
  deleteUserCtrl
} from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { updateUserSchema } from "../schemas/user.schema.js";
import { USER_TYPES } from "../configs/constants.config.js";


//get all users
router.get("/", authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), getAllUsersCtrl);
//get a user
router.get("/:id", authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), getUserCtrl);

//update a user
router.patch("/update/:id", validate({ body: updateUserSchema }), authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), updateUserCtrl);

//delete user
router.delete("/delete/:id", authenticate([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN]), deleteUserCtrl);


export default router;