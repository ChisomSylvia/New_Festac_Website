const USER_TYPES = {
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
}

const STATUS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const TAGS = {
  URBAN_PLANNING: "Urban Planning",
  REAL_ESTATE: "Real Estate",
  PROPERTY_INVESTMENT: "Property Invesment",
  CONSTRUCTION_PROJECTS: "Construction Projects",
  ENVIRONMENTAL_IMPACT: "Environmental Impact",
  ZONING_REGULATIONS: "Zoning Regulations",
  LAND_USE_POLICY: "Land Use Policy",
  ANNOUNCEMENT: "Announcement",
  INDUSTRY_NEWS: "Industry News",
};

const ACTIONS = {
  SAVE: "Save",
  PUBLISH: "Publish",
  ARCHIVE: "Archive"
}

const SORT_FIELDS = {
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  PUBLISHED_AT: "publishedAt"
}

const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
}

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
}

export { USER_TYPES, STATUS, TAGS, ACTIONS, SORT_FIELDS, SORT_ORDER, PAGINATION };