import {
  PAGINATION,
  SORT_FIELDS,
  SORT_ORDER,
} from "../configs/constants.config.js";

const capitalizeWord = (word) => {
  //capitalizes the first letter and preserves the rest (for hyphens, apostrophes, etc.)
  return word.charAt(0).toUpperCase() + word.slice(1);
};

//fxn to capitalize first letter of every word
const intelligentTitleCase = (str) => {
  const smallWords = new Set([ "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "yet" ]);

  return str
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      //preserve acronyms like FG, USA, etc.
      if (word === word.toUpperCase() && word.length <= 3) return word;

      //always capitalize first word
      if (index === 0) return capitalizeWord(word);

      //lowercase small/common words
      if (smallWords.has(word.toLowerCase())) return word.toLowerCase();

      return capitalizeWord(word);
    })
    .join(" ");
};

//fxn to normalize title
const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-") //replaces spaces with hyphen
    .replace(/[^\w-]/g, "") //removes special characters except hyphens
    .replace(/-+/g, "-") //collapse multiple hyphens into one
    .replace(/^-+|-+$/g, ""); //trim leading/trailing hyphens
};

//fxn to normalize an string to array
const normalizeToArray = (input) =>
  input === null
    ? []
    : Array.isArray(input)
    ? input
    : String(input) //ensures even null/undefined becomes a string
        .split(",") //split comma
        .map((v) => v.trim()) //remove whitespace
        .filter((v) => v.length > 0);

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

export {
  intelligentTitleCase,
  normalizeTitle,
  normalizeToArray,
  buildSearchQuery,
  calcPaginationMeta,
};