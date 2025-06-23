import BlogPostModel from "../models/blogPost.model.js";
import { ACTIONS, STATUS, USER_TYPES } from "../configs/constants.config.js";
import {
  normalizeTitle,
  createSlug,
  calcReadTime,
  buildFilterQuery,
  buildSearchQuery,
  buildSortOptions,
  calcPaginationMeta,
} from "../utils/blogPost.util.js";
import {
  handleImageUpdate,
  formatCloudinaryFile,
} from "../services/file.service.js";
import { AppError } from "../utils/appError.util.js";

//fxn to ensure unique slug
const ensureUniqueSlug = async (slug) => {
  let uniqueSlug = slug;
  let counter = 1;

  let exists;
  do {
    exists = await _getBlogPost({
      slug: uniqueSlug,
    });
    if (exists) {
      uniqueSlug = `${slug}-${counter++}`;
    }
  } while (exists);

  return uniqueSlug;
};

export const _getBlogPost = async (query) => {
  const blogPost = await BlogPostModel.findOne(query);

  if (!blogPost) {
    return null;
  }

  return blogPost;
};

//create post service
export const createPost = async (data, file) => {
  try {
    //extract action from data, default to save if not provided
    const { action = ACTIONS.SAVE, ...postData } = data;

    //validate action
    if (!Object.values(ACTIONS).includes(action)) {
      throw new AppError(
        `Invalid action. Must be one of ${Object.values(ACTIONS).join(", ")}`,
        400
      );
    }

    //create normalized titlelower from title
    postData.titleLower = normalizeTitle(postData.title);

    //check for duplicate title using titlelower before creating post
    let exists;
    try {
      exists = await _getBlogPost({
        titleLower: postData.titleLower
      });
    } catch (err) {
      if (err.message === "Post not found") {
        exists = null;
      } else {
        throw new AppError(err.message || "Unknown server error", 500);
      }
    }
        // const exists = await _getBlogPost({
        //   titleLower,
        // }).catch(() => null);

    if (exists) {
      throw new AppError(
        "A similar post title already exists. Please use a different title",
        409
      );
    }

    // Always append ellipsis to excerpt if not already present
    if (!postData.excerpt.trim().endsWith("...")) {
      postData.excerpt = `${postData.excerpt.trim()}...`;
    }

    //run action dependent modifications
    switch (action) {
      case ACTIONS.PUBLISH:
        const baseSlug = createSlug(postData.title);
        postData.slug = await ensureUniqueSlug(baseSlug);
        postData.status = STATUS.PUBLISHED;
        postData.publishedAt = new Date();
        postData.readTime = calcReadTime(postData.content);
        break;
      case ACTIONS.ARCHIVE:
        postData.status = STATUS.ARCHIVED;
        break;
      default:
        postData.status = STATUS.DRAFT;
        // postData.slug = null;
        postData.publishedAt = null;
        break;
    }

    // if (action === ACTIONS.PUBLISH) {
    //   //1. generate slug from title
    //   const baseSlug = createSlug(postData.title);
    //   postData.slug = await ensureUniqueSlug(baseSlug);
    //   //2. set status to published, date to current date, and readtime
    //   postData.status = STATUS.PUBLISHED;
    //   postData.publishedAt = new Date();
    //   postData.readTime = calcReadTime(postData.content);
    // } else if (action === ACTIONS.ARCHIVE) {
    //   postData.status = STATUS.ARCHIVED;
    // } else {
    //   postData.status = STATUS.DRAFT;
    //   postData.publishedAt = null;
    //   postData.slug = null;
    // }
    // const featuredImage = file ? formatCloudinaryFile(file) : null;
    
    postData.featuredImage = file ? formatCloudinaryFile(file) : null;

    //create blog post in database
    const newBlogPost = await BlogPostModel.create(postData);

    //determine the right message to send
    const message =
      action === ACTIONS.PUBLISH
        ? "Blog post published successfully"
        : action === ACTIONS.ARCHIVE
        ? "Blog post archived"
        : "Blog post saved as draft";

    return {
      data: newBlogPost,
      message,
    };
  } catch (error) {
    console.error("Error in createPost:", error);
    throw error;
  }
};

//get all posts service with or without queryfilters
export const getAllPosts = async (validatedParams, user = null) => {
  try {
    const filterQuery = buildFilterQuery(validatedParams, user);
    const searchQuery = buildSearchQuery({
      keyword: validatedParams.keyword,
    });

    const combinedQuery = {
      ...filterQuery,
      ...searchQuery,
    };

    const sortOptions = buildSortOptions(
      validatedParams.sortBy,
      validatedParams.sortOrder
    );

    const skip = (validatedParams.page - 1) * validatedParams.limit;

    const sort = validatedParams.keyword
      ? { score: { $meta: "textScore" }, ...sortOptions }
      : sortOptions;

    const projection = validatedParams.keyword
      ? { score: { $meta: "textScore" } }
      : {};

    const blogPosts = await BlogPostModel.find(combinedQuery, projection)
      .sort(sort)
      .skip(skip)
      .limit(validatedParams.limit)
      .lean({ virtuals: true });

    const total = await BlogPostModel.countDocuments(combinedQuery);

    const paginationMeta = calcPaginationMeta(
      total,
      validatedParams.page,
      validatedParams.limit
    );

    return {
      blogPosts,
      pagination: paginationMeta,
      appliedFilters: {
        status: validatedParams.status,
        search: validatedParams.keyword,
        sort: {
          field: validatedParams.sortBy,
          order: validatedParams.sortOrder,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error.message);
    throw error;
  }
};

//get a single post using either ID and slug
export const getPost = async (filters = {}, user = null) => {
  try {
    const { _id, id, slug } = filters;

    //prevent both id & _id use at the same time
    if (id && _id) {
      throw new AppError("Provide either 'id' or '_id', not both", 400);
    }

    const mongoId = id || _id;

    let blogPost;

    if (mongoId) {
      blogPost = await BlogPostModel.findById(mongoId);
      if (!blogPost) {
        throw new AppError(`Blog post not found with ID: ${mongoId}`, 404);
      }
    } else if (slug) {
      blogPost = await BlogPostModel.findOne({
        slug,
      });
      if (!blogPost) {
        throw new AppError(`Blog post not found with slug: ${slug}`, 404);
      }
    } else {
      throw new AppError("Either a valid ID or slug must be provided.", 400);
    }

    //exclude draft/unpublished posts for unauthenticated users
    const isAdmin =
      user?.role === USER_TYPES.ADMIN || user?.role === USER_TYPES.SUPERADMIN;

    if (!isAdmin && blogPost.status !== STATUS.PUBLISHED) {
      throw new AppError("You are not authorized to view this post.", 403);
    }

    return blogPost;
  } catch (error) {
    console.error("Error fetching blog post:", error.message);
    throw error;
  }
};

//update post
export const updatePost = async (query, updateData, file, user) => {
  try {
    const { action, ...postData } = updateData;

    //check if post is existing first
    const existingPost = await getPost(query, user);
    if (!existingPost) {
      throw new AppError("Post not found", 404);
    }

    //validate action
    if (!Object.values(ACTIONS).includes(action)) {
      throw new AppError(
        `Invalid action. Must be one of ${Object.values(ACTIONS).join(", ")}`,
        400
      );
    }

    //if updating title, update titleLower and check for duplicates excluding the current data
    if (postData.title) {
      postData.titleLower = normalizeTitle(postData.title);
      const exists = await _getBlogPost({
        titleLower: postData.titleLower,
        _id: {
          $ne: query._id,
        }, // exclude current post
      });
      if (exists) {
        console.log("Found duplicate post ID:", exists._id);
        console.log(
          "Checking duplicate for:",
          postData.titleLower,
          "excluding:",
          query._id
        );
        throw new AppError(
          "A similar post title already exists. Please use a different title",
          409
        );
      }
    }

    //update excerpt if present
    if (postData.excerpt) {
      const trimmed = postData.excerpt.trim().replace(/\.\.\.$/, "");
      postData.excerpt = `${trimmed}...`;
    }

    //run action dependant modifications
    switch (action) {
      case ACTIONS.PUBLISH:
        if (postData.title) {
          postData.slug = await ensureUniqueSlug(createSlug(postData.title));
        }
        postData.status = STATUS.PUBLISHED;
        postData.publishedAt = new Date();
        if (postData.content) {
          postData.readTime = calcReadTime(postData.content);
        }
        break;
      case ACTIONS.ARCHIVE:
        postData.status = STATUS.ARCHIVED;
        break;
      default:
        postData.status = STATUS.DRAFT;
        postData.publishedAt = null;
    }

    if (file) {
      //delete old image if new one is being uploaded
      const existingImage = existingPost.featuredImage;

      postData.featuredImage = await handleImageUpdate(file, existingImage);
    }

    const updatedBlogPost = await BlogPostModel.findOneAndUpdate(
      query,
      postData,
      { new: true }
    );
    if (!updatedBlogPost) {
      throw new AppError("Post not updated", 400);
    }

    return updatedBlogPost;
  } catch (error) {
    console.error("Error updating blog post:", error);
    throw error;
  }
};

export const deletePost = async (query) => {
  try {
    const exists = await getPost(query);
    if (!exists) {
      throw new AppError("Post not found", 404);
    }

    if (exists.featuredImage?.publicId) {
      await deleteImage(exists.featuredImage.publicId);
    }

    const delBlogPost = await BlogPostModel.findOneAndDelete(query);
    if (!delBlogPost) {
      throw new AppError("Post not found", 404);
    }

    return delBlogPost;
  } catch (error) {
    console.error("Error deleting blog post:", error.message);
    throw error;
  }
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
