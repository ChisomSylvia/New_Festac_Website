import Joi from "joi";
import {
  PAGINATION,
  SORT_FIELDS,
  SORT_ORDER,
  STATUS,
  TAGS,
  ACTIONS
} from "../configs/constants.config.js";


//create post schema
const createPostSchema = Joi.object({
  title: Joi.string().trim().pattern(/[a-zA-Z0-9]/, 'must contain at least one alphanumeric character').required(),
  excerpt: Joi.string().max(300).required(),
  content: Joi.string().required(),
  featuredImage: Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().required(),
  }),
  tags: Joi.array().items(
    Joi.string().valid(...Object.values(TAGS))
  ).max(3).unique(),
  status: Joi.string().valid(...Object.values(STATUS)).required(),
})

//get all posts schema
const getAllPostsSchema = Joi.object({
  status: Joi.string().valid(...Object.values(STATUS)).optional(),
  tags: Joi.alternatives().try(
    Joi.string().valid(...Object.values(TAGS)),
    Joi.array().items(Joi.string().valid(...Object.values(TAGS)))
  ).optional(),
  keyword: Joi.string().trim().max(50).optional(),
  sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.PUBLISHED_AT),
  sortOrder: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.DESC),
  page: Joi.number().integer().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
})


//get post schema
const getPostSchema = Joi.object({
  id: Joi.string().hex().length(24), // MongoDB ObjectId format
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'valid slug format')
}).or('id', 'slug'); // Ensure at least one of them is provided


//update post schema
const updatePostSchema = Joi.object({
  title: Joi.string().trim().pattern(/[a-zA-Z0-9]/, 'must contain at least one alphanumeric character').optional(),
  excerpt: Joi.string().max(300).optional(),
  content: Joi.string().optional(),
  featuredImage: Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().required(),
  }).optional(),
  tags: Joi.array().items(
    Joi.string().valid(...Object.values(TAGS))
  ).max(3).unique().optional(),
  status: Joi.string().valid(...Object.values(STATUS)).optional(),
  action: Joi.string().valid(...Object.values(ACTIONS)).optional(),

})



export {
  createPostSchema,
  getAllPostsSchema,
  getPostSchema,
  updatePostSchema
};