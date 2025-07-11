import Joi from "joi";
import { PHONENO_PATTERN } from "../configs/patterns.config.js";


//create message schema
const contactMsgSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).trim().required(),
  email: Joi.string().trim().email().lowercase().required(),
  phoneNumber: Joi.string().pattern(PHONENO_PATTERN).required(),
  message: Joi.string().trim().max(300).required(),
})


export {
  contactMsgSchema
};