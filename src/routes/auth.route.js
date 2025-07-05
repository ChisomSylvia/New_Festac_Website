import { Router } from "express";
const router = Router();
import {
  signup,
  login,
  logout,
  changePasswordCtrl,
  refreshToken
} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { signUpSchema, loginSchema, changePasswordSchema } from "../schemas/user.schema.js";
import { USER_TYPES } from "../configs/constants.config.js";
import { profileImageUpload } from "../libs/multer.lib.js";


//super admin signup route
router.post( "/", profileImageUpload.single("profileImage"), validate({ body: signUpSchema }), signup );

//admin signup route
router.post("/admin-signup", authenticate([USER_TYPES.SUPERADMIN]), profileImageUpload.single("profileImage"), validate({
  body: signUpSchema
}), signup);

//login route
router.post( "/login", validate({ body: loginSchema }), login );

//logout route
router.post( "/logout", logout );

router.post("/refresh-token", authenticate([]), refreshToken);

//change password route
router.patch("/change-password", authenticate([]), validate({ body: changePasswordSchema }),
changePasswordCtrl);


export default router;