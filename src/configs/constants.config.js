const USER_TYPES = {
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
}

const STATUS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const ACTIONS = {
  SAVE: "Save",
  PUBLISH: "Publish",
  ARCHIVE: "Archive"
}

const SORT_FIELDS = {
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  PUBLISHED_AT: "publishedAt",
  LISTED_AT: "listedAt"
}

const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
}

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};

const TYPE = {
  ADMIN_OFFICE: "District Administrative Office",
  TECH_HUB: "Tech Hub",
  SHOPPING_MALL: "Shopping Mall",
  CORNER_SHOPS: "Corner Shops",
  EVENT_CENTER: "Event Center",
  GYM: "Gym",
  SEMI_DETACHED_DUPLEX: "Semi-Detached 4-Bedroom Duplex",
  VILLA: "6-Bedroom Villa",
  BLOCK_OF_FLATS_2BR: "Block of 8 Flats - 2 Bedrooms Each",
  BLOCK_OF_FLATS_3BR: "Block of 8 Flats - 3 Bedrooms Each",
  DUPLEX: "4-Bedroom Duplex",
  CHRISTIAN_CENTER: "Christian Worship Center",
  ISLAMIC_CENTER: "Islamic Worship Center",
  AUTO_WORKSHOP: "Automobile Paint Workshop",
  HEALTH_CENTER: "Health Center",
  NUR_PRI_SCHOOL: "Nursery & Primary School",
  SECONDARY_SCHOOL: "Secondary School",
};

const CATEGORY = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  INSTITUTIONAL: "Institutional",
  RECREATIONAL: "Recreational",
  LAND: "Land",
};

const PROP_STATUS = {
  AVAILABLE: "Available",
  NOT_AVAILABLE: "Not Available",
  SOLD: "Sold",
};

const PROP_ACTION = {
  SAVE: "Save",
  PUBLISH: "Publish",
}

export { USER_TYPES, STATUS, ACTIONS, SORT_FIELDS, SORT_ORDER, PAGINATION, TYPE, CATEGORY, PROP_STATUS, PROP_ACTION };




// const TAGS = {
//   URBAN_PLANNING: "Urban Planning",
//   REAL_ESTATE: "Real Estate",
//   PROPERTY_INVESTMENT: "Property Invesment",
//   CONSTRUCTION_PROJECTS: "Construction Projects",
//   ENVIRONMENTAL_IMPACT: "Environmental Impact",
//   ZONING_REGULATIONS: "Zoning Regulations",
//   LAND_USE_POLICY: "Land Use Policy",
//   ANNOUNCEMENT: "Announcement",
//   INDUSTRY_NEWS: "Industry News",
// };