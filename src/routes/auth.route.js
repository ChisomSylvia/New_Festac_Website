import { Router } from "express";
const router = Router();
import { createSuperAdmin, createAdmin, login, logout } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { signUpSchema, loginSchema } from "../schemas/user.schema.js";
import { USER_TYPES } from "../configs/constants.config.js";


//super admin signup route
router.post( "/", validate({ body: signUpSchema }), createSuperAdmin );

//admin signup route
router.post( "/admin-signup", authenticate([USER_TYPES.SUPERADMIN]), validate({ body: signUpSchema }), createAdmin );

//login route
router.post( "/login", validate({ body: loginSchema }), login );

//logout route
router.post( "/logout", logout );


export default router;