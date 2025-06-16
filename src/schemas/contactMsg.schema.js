import Joi from "joi";


//create message schema
const contactMsgSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).trim().required(),
  email: Joi.string().trim().email().lowercase().required(),
  subject: Joi.string().trim().required(),
  message: Joi.string().trim().required(),
})


export {
  contactMsgSchema
};