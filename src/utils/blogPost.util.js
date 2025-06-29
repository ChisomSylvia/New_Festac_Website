import {
  PAGINATION,
  SORT_FIELDS,
  SORT_ORDER,
  STATUS,
  USER_TYPES,
} from "../configs/constants.config.js";

//fxn to create slug from title
const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-") //replaces spaces with hyphen
    .replace(/[^\w-]/g, "") //removes special characters except hyphens
    .replace(/-+/g, "-") //collapse multiple hyphens into one
    .replace(/^-+|-+$/g, ""); //trim leading/trailing hyphens
};

// const titleCaseWithAcronyms = (str) => {
//   return str
//   .trim()
//   .split(/\s+/)
//   .map(word => {
//     // Keep acronyms (like FG, USA) fully uppercase if they already are
//     if (word === word.toUpperCase() && word.length <= 3) {
//       return word;
//     }

//     // Capitalize first letter only
//     return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//   }).join(" ");
// }

const capitalizeWord = (word) => {
  // Capitalizes the first letter and preserves the rest (for hyphens, apostrophes, etc.)
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const intelligentTitleCase = (str) => {
  const smallWords = new Set([
    "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "yet"
  ]);

  return str
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      // Preserve acronyms like FG, USA, etc.
      if (word === word.toUpperCase() && word.length <= 3) return word;

      // Always capitalize first word
      if (index === 0) return capitalizeWord(word);

      // Lowercase small/common words
      if (smallWords.has(word.toLowerCase())) return word.toLowerCase();

      return capitalizeWord(word);
    })
    .join(" ");
};

const emojiRegex =
  /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+|\p{Emoji_Presentation}/gu;

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
  return readTime > 0 ? `${readTime} min read` : "1 min read";
};

//fxn to build search query
const buildSearchQuery = ({ keyword }) => {
  if (!keyword || !keyword.trim()) return {};

  return {
    $text: {
      $search: keyword.trim(),
    },
  };
};

//fxn to calculate pagination metadata
const calcPaginationMeta = (
  total,
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT
) => {
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
  };
};

//fxn to build filter query based on user permissions
const buildFilterQuery = (params, user = null) => {
  const query = {};

  //allow user based filtering
  const isAdmin =
    user?.role === USER_TYPES.ADMIN || user?.role === USER_TYPES.SUPERADMIN;

  if (isAdmin) {
    // Admins can filter by any status or get all if none is provided
    if (params.status) {
      query.status = params.status;
    }
  } else {
    // Regular users can only see published posts
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
  normalizeTitle,
  intelligentTitleCase,
  createSlug,
  calcReadTime,
  buildSearchQuery,
  calcPaginationMeta,
  buildFilterQuery,
  buildSortOptions,
};
