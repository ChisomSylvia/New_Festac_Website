import mongoose from "mongoose";
import BlogPostModel from "../models/blogPost.model.js";
import { ACTIONS, STATUS, USER_TYPES } from "../configs/constants.config.js";
import { intelligentTitleCase, normalizeTitle,  buildSearchQuery,  calcPaginationMeta, } from "../utils/utils.js";
import {
  createSlug,
  calcReadTime,
  buildFilterQuery,
  buildSortOptions,
} from "../utils/blogPost.util.js";
import {
  handleImageUpdate,
  deleteImage,
  generatePublicIdBase,
  processImageUpload,
  cleanupTempUploads,
} from "../services/file.service.js";
import { AppError } from "../utils/appError.util.js";

//fxn to ensure unique slug
const ensureUniqueSlug = async (slug) => {
  let uniqueSlug = slug;
  let counter = 1;

  let exists;
  do {
    exists = await BlogPostModel.findOne({
      slug: uniqueSlug,
    });
    if (exists) {
      uniqueSlug = `${slug}-${counter++}`;
    }
  } while (exists);

  return uniqueSlug;
};

//create post service
export const createPost = async (data, file) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //extract action from data, default to save if not provided
    const { action = ACTIONS.SAVE, ...postData } = data;

    //generate permanent public ID base
    const publicIdBase = generatePublicIdBase();
    postData.publicIdBase = publicIdBase;

    //capitalize first letter of every word
    postData.title = intelligentTitleCase(postData.title);

    //create normalized titlelower from title
    postData.titleLower = normalizeTitle(postData.title);

    //check for duplicate title using titlelower before creating post
    const exists = await BlogPostModel.findOne({ titleLower: postData.titleLower }).session(session);
    if (exists) {
      throw new AppError( "A similar post title already exists. Please use a different title", 409 );
    }

    //always append ellipsis to excerpt if not already present
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
        postData.publishedAt = null;
    }

    //process image with permanent public ID
    let image = null;

    if (file) {
      try {
        image = await processImageUpload(file, publicIdBase, 0);
      } catch (error) {
        throw new AppError("Image upload failed", 500);
      }

      postData.featuredImage = image;
    }

    //create blog post in database
    const newBlogPost = await BlogPostModel.create([postData], { session });

    await session.commitTransaction();

    //determine the right message to send
    const message =
      action === ACTIONS.PUBLISH
        ? "Blog post published successfully"
        : action === ACTIONS.ARCHIVE
        ? "Blog post archived"
        : "Blog post saved as draft";

    return {
      data: newBlogPost[0],
      message,
    };
  } catch (error) {
    await session.abortTransaction();

    await cleanupTempUploads(file);

    console.error("Error in createPost:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//get all posts service with or without queryfilters
export const getAllPosts = async (query, user = null) => {
  try {
    const filterQuery = buildFilterQuery(query, user);
    const searchQuery = buildSearchQuery({
      keyword: query.keyword,
    });

    const combinedQuery = {
      ...filterQuery,
      ...searchQuery,
    };

    const sortOptions = buildSortOptions(
      query.sortBy,
      query.sortOrder
    );

    const skip = (query.page - 1) * query.limit;

    const sort = query.keyword
      ? { score: { $meta: "textScore" }, ...sortOptions }
      : sortOptions;

    const projection = query.keyword
      ? { score: { $meta: "textScore" } }
      : {};

    const blogPosts = await BlogPostModel.find(combinedQuery, projection)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean({ virtuals: true });

    const total = await BlogPostModel.countDocuments(combinedQuery);

    const paginationMeta = calcPaginationMeta(
      total,
      query.page,
      query.limit
    );

    return {
      blogPosts,
      pagination: paginationMeta,
      appliedFilters: {
        status: query.status,
        search: query.keyword,
        sort: {
          field: query.sortBy,
          order: query.sortOrder,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error.message);
    throw error;
  }
};

//get a single post using either ID or slug
export const getPost = async (query, user = null) => {
  try {
    const blogPost = await BlogPostModel.findOne(query);

    console.log("Query", query);

    if (!blogPost) {
      throw new AppError("Blog post not found", 404)
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
export const updatePost = async (query, updateData, file) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { action, ...postData } = updateData;

    //check if post exists in the db
    const existingPost = await BlogPostModel.findOne(query).session(session);
    if (!existingPost) {
      throw new AppError("Post not found", 404);
    }

    //use original public ID base
    const publicIdBase = existingPost.publicIdBase;

    //normalize title and check for duplicates
    if (postData.title) {
      postData.title = intelligentTitleCase(postData.title);
      postData.titleLower = normalizeTitle(postData.title);
      const exists = await BlogPostModel.findOne({
        titleLower: postData.titleLower,
        _id: {
          $ne: query._id,
        }, // exclude current post from duplicate check
      }).session(session);
      if (exists) {
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

    //handle image update within transaction safe log
    if (file) {
      try {
        const existingImage = existingPost.featuredImage;

        postData.featuredImage = await handleImageUpdate(
          file,
          existingImage,
          publicIdBase,
          0
        );
      } catch (imageError) {
        throw new AppError(
          "Image update failed. Rollback activated.",
          500
        );
      }
    }

    const updatedBlogPost = await BlogPostModel.findOneAndUpdate(
      query,
      postData,
      { new: true, session }
    );

    if (!updatedBlogPost) {
      throw new AppError("Post not updated", 400);
    }

    await session.commitTransaction();

    return updatedBlogPost;
  } catch (error) {
    await session.abortTransaction();

    await cleanupTempUploads(file);

    console.error("Error updating blog post:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

//delete post plus image from cloudinary
export const deletePost = async (query) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const exists = await BlogPostModel.findOne(query).session(session);
    if (!exists) {
      throw new AppError("Post not found", 404);
    }

    const publicId = exists.featuredImage?.publicId;

    const delBlogPost = await BlogPostModel.findOneAndDelete(query).session(
      session
    );
    if (!delBlogPost) {
      throw new AppError("Failed to delete post", 500);
    }

    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (cloudError) {      
        throw new AppError(
          "Image deletion failed. Rollback activated.",
          500
        );
      }
    }

    //commit the transaction
    await session.commitTransaction();

    return delBlogPost;
  } catch (error) {
    await session.abortTransaction();

    console.error("Error deleting blog post:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
};