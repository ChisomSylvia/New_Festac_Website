import {
  PAGINATION,
  SORT_FIELDS,
  SORT_ORDER,
  STATUS,
  USER_TYPES,
} from "../configs/constants.config.js";

const emojiRegex =
  /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+|\p{Emoji_Presentation}/gu;

//fxn to create slug from title
const createSlug = (title) => {
  let base = title
    .toLowerCase()
    .replace(emojiRegex, "") //remove emojis
    .replace(/[^a-z0-9\s-]/g, "") //remove special characters
    .replace(/\s+/g, "-") //replace spaces with hyphens
    .replace(/-+/g, "-") //collapse multiple hyphens
    .trim();

  // Fallback if slug becomes empty
  if (!base || base === "-") {
    base = `post-${Date.now()}`;
  }

  return base;
};

//fxn to calculate average read time
const calcReadTime = (content) => {
  const wordsPerMinute = 100;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime > 0 ? `${readTime} min read` : "1 min read";
};

//fxn to build filter query based on user permissions
const buildFilterQuery = (params, user = null) => {
  const query = {};

  //allow user based filtering
  const isAdmin =
    user?.role === USER_TYPES.ADMIN || user?.role === USER_TYPES.SUPERADMIN;

  if (isAdmin) {
    //admins can filter by any status or get all if none is provided
    if (params.status) {
      query.status = params.status;
    }
  } else {
    //regular users can only see published posts
    query.status = STATUS.PUBLISHED;
  }

  return query;
};

//fxn to build sort options
const buildSortOptions = (
  sortBy = SORT_FIELDS.PUBLISHED_AT,
  sortOrder = SORT_ORDER.DESC
) => {
  const validSortFields = Object.values(SORT_FIELDS);
  const validSortField = validSortFields.includes(sortBy)
    ? sortBy
    : SORT_FIELDS.PUBLISHED_AT;
  const validSortOrder = sortOrder === SORT_ORDER.ASC ? 1 : -1;

  return {
    [validSortField]: validSortOrder,
  };
};

export {
  createSlug,
  calcReadTime,
  buildFilterQuery,
  buildSortOptions
};