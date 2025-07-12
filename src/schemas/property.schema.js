import Joi from "joi";
import {
  CATEGORY,
  PROP_ACTION,
  PROP_STATUS,
  TYPE,
  SORT_FIELDS,
  SORT_ORDER,
  PAGINATION,
} from "../configs/constants.config.js";
import { PHONENO_PATTERN } from "../configs/patterns.config.js";

//create properties schema
const createPropertySchema = Joi.object({
  title: Joi.string()
    .trim()
    .pattern(/[a-zA-Z0-9]/)
    .required()
    .messages({
      "string.pattern.base": "must contain at least one alphanumeric character",
    }),

  location: Joi.string().trim().required(),

  description: Joi.string().trim().required(),

  keyFeatures: Joi.string().trim().required(),

  size: Joi.string().trim().required(),

  price: Joi.string().trim().required(),

  contactInfo: Joi.object({
    phoneNumber: Joi.string().pattern(PHONENO_PATTERN).required(),
    whatsappNo: Joi.string().pattern(PHONENO_PATTERN).required(),
    email: Joi.string().email().required()
  }),

  category: Joi.alternatives().try(Joi.array().items(Joi.string().valid(...Object.values(CATEGORY))),
  Joi.string().valid(...Object.values(CATEGORY))
  ).required(),

  // type: Joi.string()
  //   .valid(...Object.values(TYPE))
  //   .required(),

  // image: Joi.array()
  //   .items(
  //     Joi.object({
  //       url: Joi.string().uri().required(),
  //       publicId: Joi.string().required(),
  //     })
  //   )
  //   .required()
  //   .min(1)
  //   .max(10),

  bedrooms: Joi.string().when("category", {
    is: CATEGORY.RESIDENTIAL,
    then: Joi.required(),
  }),

  bathrooms: Joi.string().when("category", {
    is: CATEGORY.RESIDENTIAL,
    then: Joi.required(),
  }),

  action: Joi.string()
    .valid(...Object.values(PROP_ACTION))
    .required(),
});

//get all properties schema
const getAllPropertiesSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(PROP_STATUS))
    .optional(),
  type: Joi.string()
    .valid(...Object.values(TYPE))
    .optional(),
  category: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().valid(...Object.values(CATEGORY))),
      Joi.string().valid(...Object.values(CATEGORY))
    )
    .optional()
    .custom((value, helpers) => {
      if (typeof value === "string") return [value]; // convert to array
      return value;
    }),
  size: Joi.string().optional(),
  bedrooms: Joi.string().optional(),
  bathrooms: Joi.string().optional(),
  min_price: Joi.number().integer().optional(),
  max_price: Joi.number().integer().optional(),
  keyword: Joi.string().trim().lowercase().max(50).optional(),
  sortBy: Joi.string()
    .valid(...Object.values(SORT_FIELDS))
    .default(SORT_FIELDS.PUBLISHED_AT),
  sortOrder: Joi.string()
    .valid(...Object.values(SORT_ORDER))
    .default(SORT_ORDER.DESC),
  page: Joi.number().integer().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

//update property schema
const updatePropertySchema = Joi.object({
  title: Joi.string()
    .trim()
    .pattern(/[a-zA-Z0-9]/)
    .optional()
    .messages({
      "string.pattern.base": "must contain at least one alphanumeric character",
    }),

  location: Joi.string().trim().optional(),

  description: Joi.string().trim().optional(),

  keyFeatures: Joi.string().trim().optional(),

  size: Joi.string().trim().optional(),

  price: Joi.string().trim().optional(),

  contactInfo: Joi.object({
    phoneNumber: Joi.string().pattern(PHONENO_PATTERN).optional(),
    whatsappNo: Joi.string().pattern(PHONENO_PATTERN).optional(),
    email: Joi.string().email().optional()
  }).optional(),

  category: Joi.alternatives().try(Joi.array().items(Joi.string().valid(...Object.values(CATEGORY))),
    Joi.string().valid(...Object.values(CATEGORY))
  ).optional(),

  // type: Joi.string()
  //   .valid(...Object.values(TYPE))
  //   .optional(),

  // image: Joi.array()
  //   .items(
  //     Joi.object({
  //       url: Joi.string().uri().required(),
  //       publicId: Joi.string().required(),
  //     })
  //   )
  //   .optional()
  //   .min(1)
  //   .max(10),

  bedrooms: Joi.string().when("category", {
    is: CATEGORY.RESIDENTIAL,
    then: Joi.optional(),
  }),

  bathrooms: Joi.string().when("category", {
    is: CATEGORY.RESIDENTIAL,
    then: Joi.optional(),
  }),

  action: Joi.string()
    .valid(...Object.values(PROP_ACTION))
    .required(),

  replaceIndex: Joi.alternatives()
    .try(Joi.number(), Joi.array().items(Joi.number()))
    .optional(),

  deleteIndex: Joi.alternatives()
    .try(Joi.number(), Joi.array().items(Joi.number()))
    .optional(),

  append: Joi.boolean().optional(),
});


export {
  createPropertySchema,
  getAllPropertiesSchema,
  updatePropertySchema,
};