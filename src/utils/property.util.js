import {
  PROP_STATUS,
  SORT_FIELDS,
  SORT_ORDER,
  USER_TYPES,
} from "../configs/constants.config.js";
import { normalizeToArray } from "./utils.js";

//fxn to build filter query based on user permissions
const buildFilterQuery = (params, user = null) => {
  const query = {};

  //allow user based filtering
  const isAdmin =
    user?.role === USER_TYPES.ADMIN || user?.role === USER_TYPES.SUPERADMIN;

  //update query object with status filter
  if (isAdmin) {
    if (params.status) {
      query.status = params.status;
    }
  } else {
    query.status = {
      $in: [PROP_STATUS.AVAILABLE || PROP_STATUS.SOLD]
    };
  }
  
  //update query object with type filter
  if (params.type) query.type = params.type;

  //update query object with type filter
  if (params.size) query.size = params.size;

  //update query object with bedroom filter
  if (params.bedrooms) query.bedrooms = params.bedrooms;

  //update query object with bathroom filter
  if (params.bathrooms) query.bathrooms = params.bathrooms;

  //update query object with category filter
  if (params.category) {
    query.category = { $in: normalizeToArray(params.category) };
  };

  //update query object with price filter
  if (params.min_price || params.max_price) {
    query.price = {};
    if (params.min_price) query.price.$gte = Number(params.min_price);
    if (params.max_price) query.price.$lte = Number(params.max_price);
  };

  return query;
};

//fxn to build sort options
const buildSortOptions = (
  sortBy = SORT_FIELDS.LISTED_AT,
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

export { buildFilterQuery, buildSortOptions }