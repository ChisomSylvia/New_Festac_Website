import Joi from "joi";

export const objectIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
})