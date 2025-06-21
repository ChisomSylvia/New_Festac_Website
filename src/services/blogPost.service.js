import BlogPostModel from "../models/blogPost.model.js";
import {
  ACTIONS,
  STATUS
} from "../configs/constants.config.js";
import {
  normalizeTitle,
  createSlug,
  calcReadTime,
  buildFilterQuery,
  buildSearchQuery,
  buildSortOptions,
  calcPaginationMeta
} from "../utils/blogPost.util.js";
import {
  // handleImageUpdate,
  formatCloudinaryFile
} from "../services/file.service.js";
import {
  AppError
} from "../utils/appError.util.js";

//fxn to ensure unique slug
const ensureUniqueSlug = async (slug) => {
  let uniqueSlug = slug;
  let counter = 1;

  let exists;
  do {
    exists = await _getBlogPost({
      slug: uniqueSlug
    });
    if (exists) {
      uniqueSlug = `${slug}-${counter++}`;
    }
  } while (exists);

  return uniqueSlug;
}

export const _getBlogPost = async (query) => {
  const blogPost = await BlogPostModel.findOne(query);
  console.log("post found", blogPost);


  if (!blogPost) {
    return null;
  }

  return blogPost;
};


export const createPost = async (data, file) => {
  //extract actions from data, default to save if not provided
  const {
    action = ACTIONS.SAVE, ...postData
  } = data;

  //validate action
  if (action && !Object.values(ACTIONS).includes(action)) {
    throw new AppError(`Invalid action. Must be one of ${Object.values(ACTIONS).join(", ")}`, 400);
  };

  //create normalized titlelower from title
  const titleLower = normalizeTitle(postData.title);
  //check for duplicate title using titlelower before creating post
  const exists = await _getBlogPost({
    titleLower
  }).catch(() => null);

  if (exists) {
    throw new AppError("A similar post title already exists. Please use a different title", 409);
  }

  if (action === ACTIONS.PUBLISH) {
    //1. generate slug from title
    const baseSlug = createSlug(postData.title);
    postData.slug = await ensureUniqueSlug(baseSlug);
    //2. set status to published, date to current date, and readtime
    postData.status = STATUS.PUBLISHED;
    postData.publishedAt = new Date();
    postData.readTime = calcReadTime(postData.content);
  } else if (action === ACTIONS.ARCHIVE) {
    postData.status = STATUS.ARCHIVED;
  } else {
    postData.status = STATUS.DRAFT;
    postData.publishedAt = null;
    postData.slug = null
  }

  const featuredImage = file ?
    formatCloudinaryFile(file) :
    null;

  // console.log("Uploaded File:", file);

  //create blog post in database
  const newBlogPost = await BlogPostModel.create({
    ...postData,
    titleLower,
    featuredImage
  });

  //determine the right message to send
  const message = action === ACTIONS.PUBLISH ?
    "Blog post published successfully" :
    action === ACTIONS.ARCHIVE ?
    "Blog post archived" :
    "Blog post saved as draft";

  return {
    data: newBlogPost,
    message
  }
};


export const getAllPosts = async (validatedParams, userId = null, isAdmin = false) => {
  try {
    const filterQuery = buildFilterQuery(validatedParams, userId, isAdmin);
    const searchQuery = buildSearchQuery({
      keyword: validatedParams.keyword
    });
    const combinedQuery = {
      ...filterQuery,
      ...searchQuery
    };
    const sortOptions = buildSortOptions(validatedParams.sortBy, validatedParams.sortOrder);
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    const blogPosts = await BlogPostModel.find(combinedQuery, {
        score: {
          $meta: "textScore"
        }
      })
      .sort({
        score: {
          $meta: "textScore"
        },
        ...sortOptions
      })
      .skip(skip)
      .limit(validatedParams.limit)
      .lean({
        virtuals: true
      });

    const total = await BlogPostModel.countDocuments(combinedQuery);
    const paginationMeta = calcPaginationMeta(total, validatedParams.page, validatedParams.limit);

    return {
      blogPosts,
      pagination: paginationMeta,
      appliedFilters: {
        status: validatedParams.status,
        tags: validatedParams.tags,
        search: validatedParams.keyword,
        sort: {
          field: validatedParams.sortBy,
          order: validatedParams.sortOrder
        }
      }
    };
  } catch (error) {
    throw new AppError(`Failed to get posts: ${error.message}`)
  }
};


export const getPost = async (filters) => {
  const {
    id,
    slug
  } = filters;

  const blogPost = id ?
    await BlogPostModel.findById(id) :
    await BlogPostModel.findOne({
      slug
    });

  if (!blogPost) {
    const ref = id ?
      `ID: ${id}` :
      `slug: ${slug}`;
    throw new Error(`Blog post not found with ${ref}`);
  }

  // const query = {};
  // if (id) query._id = id;
  // if (slug) query.slug = slug;

  // const blogPost = await BlogPostModel.findOne(query);

  // if (!blogPost) {
  //   throw new Error("Post not found");
  // }

  return blogPost;
};


export const updatePost = async (query, updateData) => {
  const {
    action,
    ...postData
  } = updateData;

  //if updating title, check for duplicates
  if (postData.title) {
    const titleLower = normalizeTitle(postData.title);
    const exists = await getPost({
      titleLower,
      _id: {
        $ne: query._id
      }, // exclude current post
    });
    if (exists) {
      throw new Error("A similar post title already exists. Please use a different title");
    }
    postData.titleLower = titleLower;
  }

  //handle action based update
  if (action === ACTIONS.PUBLISH) {
    //generate slug from title
    if (!postData.slug && postData.title) {
      const baseSlug = createSlug(postData.title);
      postData.slug = await ensureUniqueSlug(baseSlug);
    }
    //set status to published, date to current date, and readtime
    postData.status = STATUS.PUBLISHED;
    postData.publishedAt = new Date();
    if (postData.content) {
      postData.readTime = calcReadTime(postData.content);
    }
  } else if (action === ACTIONS.ARCHIVE) {
    postData.status = STATUS.ARCHIVED;
  } else {
    postData.status = STATUS.DRAFT;
    postData.publishedAt = null;
    postData.slug = null
  }

  const updatedBlogPost = await BlogPostModel.findOneAndUpdate(query, {
    ...postData,
    updatedAt: new Date()
  }, {
    new: true
  });

  if (!updatedBlogPost) {
    throw new Error('Post not found')
  }

  return updatedBlogPost;
};


export const deletePost = async (query) => {
  const exists = await getPost(query);
  if (!exists) {
    throw new Error("Post not found");
  }

  if (exists.featuredImage?.publicId) {
    await deleteImage(exists.featuredImage.publicId);
  }

  const delBlogPost = await BlogPostModel.findOneAndDelete(query);
  if (!delBlogPost) {
    throw new Error("Post not found")
  }

  return delBlogPost;
};



// export const incrementViews = async (query) => {
//   const updatedBlogPost = await BlogPostModel.findOneAndUpdate(query, {
//     $inc: {
//       views: 1
//     }
//   }, {
//     new: true
//   });
//   return updatedBlogPost;
// };