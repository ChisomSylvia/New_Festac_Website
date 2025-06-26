import {
  PAGINATION,
  SORT_FIELDS,
  SORT_ORDER,
} from "../configs/constants.config.js";

const capitalizeWord = (word) => {
  // Capitalizes the first letter and preserves the rest (for hyphens, apostrophes, etc.)
  return word.charAt(0).toUpperCase() + word.slice(1);
};


const intelligentTitleCase = (str) => {
  const smallWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "in",
    "nor",
    "of",
    "on",
    "or",
    "so",
    "the",
    "to",
    "up",
    "yet",
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

//fxn to normalize an string to array
const normalizeToArray = (input) =>
  Array.isArray(input)
    ? input
    : String(input)
        .split(",")
        .map((v) => v.trim());

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
    totalData: total,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  };
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
  intelligentTitleCase,
  normalizeToArray,
  buildSearchQuery,
  calcPaginationMeta,
  buildSortOptions,
};