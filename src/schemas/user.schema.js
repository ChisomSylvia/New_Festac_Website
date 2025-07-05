import Joi from "joi";
import {
  PASSWORD_PATTERN,
  PHONENO_PATTERN,
} from "../configs/patterns.config.js";
import { USER_TYPES } from "../configs/constants.config.js";

//Sign up schema
const signUpSchema = Joi.object({
  name: Joi.string().trim().min(4).max(50).required(),
  email: Joi.string().trim().email().lowercase().required(),
  phoneNumber: Joi.string().pattern(PHONENO_PATTERN).required(),
  password: Joi.string().pattern(PASSWORD_PATTERN).trim().default("user"),
  role: Joi.string()
    .valid(...Object.values(USER_TYPES))
    .required(),
});

//Login schema
const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

//update user schema
const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(4).max(50).optional(),
  email: Joi.string().trim().email().lowercase().optional(),
  phoneNumber: Joi.string().pattern(PHONENO_PATTERN).optional(),
}).min(1);

//change password schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().trim().required(),
  newPassword: Joi.string().pattern(PASSWORD_PATTERN).trim().required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({ "any.only": "Confirm password must match new password" })
});

export { signUpSchema, loginSchema, updateUserSchema, changePasswordSchema };