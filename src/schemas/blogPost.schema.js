import Joi from "joi";
import {
  PAGINATION,
  SORT_FIELDS,
  SORT_ORDER,
  STATUS,
  ACTIONS,
} from "../configs/constants.config.js";

//create post schema
const createPostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .pattern(/[a-zA-Z0-9]/)
    .required()
    .messages({
      "string.pattern.base": "must contain at least one alphanumeric character",
    }),

  excerpt: Joi.string().max(300).required(),

  content: Joi.string().required(),

  featuredImage: Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().required(),
  }),

  action: Joi.string()
    .valid(...Object.values(ACTIONS))
    .optional(),
});

//get all posts schema
const getAllPostsSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(STATUS))
    .optional(),
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

//get post schema
const getPostSchema = Joi.object({
  _id: Joi.string().hex().length(24), // MongoDB ObjectId format
  id: Joi.string().hex().length(24),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .messages({
      "string.pattern.base":
        "Slug must be lowercase and hyphen-separated (e.g., my-post-title)",
    }),
}).xor("_id", "id", "slug");

//update post schema
const updatePostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .pattern(/[a-zA-Z0-9]/)
    .messages({
      "string.pattern.base": "must contain at least one alphanumeric character",
    })
    .optional(),

  excerpt: Joi.string().max(300).optional(),

  content: Joi.string().optional(),

  featuredImage: Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().required(),
  }).optional(),

  action: Joi.string()
    .valid(...Object.values(ACTIONS))
    .required(),
});

export { createPostSchema, getAllPostsSchema, getPostSchema, updatePostSchema };