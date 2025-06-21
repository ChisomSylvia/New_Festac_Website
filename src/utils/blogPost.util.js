import {
  PAGINATION,
  SORT_FIELDS,
  SORT_ORDER,
  STATUS
} from "../configs/constants.config.js";

//fxn to create slug from title
const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-") //replaces spaces with hyphen
    .replace(/[^\w-]/g, "") //removes special characters except hyphens
    .replace(/-+/g, "-") //collapse multiple hyphens into one
    .replace(/^-+|-+$/g, "") //trim leading/trailing hyphens
};

const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+|\p{Emoji_Presentation}/gu;

//fxn to create slug from title
const createSlug = (title) => {
  let base = title
    .toLowerCase()
    .replace(emojiRegex, "") // Remove emojis
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .trim();

  // Fallback if slug becomes empty
  if (!base || base === "-") {
    base = `post-${Date.now()}`;
  }

  return base;
};


//fxn to calculate average read time
const calcReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime > 0 ? `${readTime} min read` : "1 min read"
}

//fxn to build search query
const buildSearchQuery = ({
  keyword
}) => {
  if (!keyword || !keyword.trim()) return {};

  return {
    $text: {
      $search: keyword.trim()
    }
  };
}

//fxn to calculate pagination metadata
const calcPaginationMeta = (total, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalPosts: total,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  }
}

//fxn to build filter query based on user permissions
const buildFilterQuery = (params, userId = null, isAdmin = false) => {
  const query = {};
  if (isAdmin) {
    if (params.status) {
      query.status = params.status || STATUS.PUBLISHED;
    } else {
      query.status = STATUS.PUBLISHED;
    }
  } else {
    query.status = STATUS.PUBLISHED;
  }

  if (params.tags && params.tags.length > 0) {
    query.tags = {
      $in: params.tags
    };
  }

  return query;
}

//fxn to build sort options
const buildSortOptions = (sortBy = SORT_FIELDS.PUBLISHED_AT, sortOrder = SORT_ORDER.DESC) => {
  const validSortFields = Object.values(SORT_FIELDS);
  const validSortField = validSortFields.includes(sortBy) ? sortBy : SORT_FIELDS.PUBLISHED_AT;
  const validSortOrder = sortOrder === SORT_ORDER.ASC ? 1 : -1;

  return {
    [validSortField]: validSortOrder
  };
}


export {
  normalizeTitle,
  createSlug,
  calcReadTime,
  buildSearchQuery,
  calcPaginationMeta,
  buildFilterQuery,
  buildSortOptions
}



// const buildSearchQuery = (searchParams) => {
//   const { searchTerm } = searchParams;

//   if (!searchTerm || !searchTerm.trim()) return {};

//   const words = searchTerm.trim().split(/\s+/);

//   const regexConditions = words.flatmap(word => [
//     { title: new RegExp(word, "i") },
//     { excerpt: new RegExp(word, "i") },
//     { content: new RegExp(word, "i") },
//   ]);

//   return { $or: regexConditions };
// }