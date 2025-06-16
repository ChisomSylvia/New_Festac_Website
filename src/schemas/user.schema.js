import Joi from "joi";
import { PASSWORD_PATTERN, PHONENO_PATTERN } from "../utils/user.util.js";

// const phoneNoPattern = new RegExp(/^(?:\+?234|0)?[789]\d{9}$/);

// const passwordPattern = new RegExp(
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,30}$/
// );

//Sign up schema


const signUpSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email().lowercase().required(),
  phoneNumber: Joi.string()
    .pattern(PHONENO_PATTERN)
    .required(),
  password: Joi.string()
    .pattern(PASSWORD_PATTERN).trim().default("user"),
})


//Login schema
const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
})


//update user schema
const updateUserSchema = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().trim().email().lowercase().optional(),
  phoneNumber: Joi.string()
    .pattern(PHONENO_PATTERN)
    .optional(),
  password: Joi.string()
    .pattern(PASSWORD_PATTERN).trim().optional(),
}).min(1);


export {
  signUpSchema,
  loginSchema,
  updateUserSchema,
};