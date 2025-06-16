import { Router } from "express";
const router = Router();
import { createAdmin, login, logout } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import { signUpSchema, loginSchema } from "../schemas/user.schema.js";
import { USER_TYPES } from "../utils/user.util.js";


//super admin signup route
router.post( "/", validate(signUpSchema), createAdmin );

//admin signup route
router.post( "/admin-signup", authenticate([USER_TYPES.ADMIN]), validate(signUpSchema), createAdmin );

//login route
router.post( "/login", validate(loginSchema), login );

//logout route
router.post( "/logout", logout );


export default router;