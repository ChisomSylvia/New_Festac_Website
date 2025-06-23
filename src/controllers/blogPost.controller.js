import {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
} from "../services/blogPost.service.js";

//create blog post controller
export const createPostCtrl = async (req, res, next) => {
  try {
    const { validatedBody: body } = req;
    const { file } = req;

    const newBlogPost = await createPost(body, file);

    return res.status(201).json({
      success: true,
      message: newBlogPost.message,
      data: newBlogPost.data,
    });
  } catch (error) {
    console.error("createPostCtrl Error:", error.message);
    next(error);
  }
};

//get all posts controller
export const getAllPostsCtrl = async (req, res, next) => {
  try {
    // const { validatedQuery: query } = req;
    const { validatedQuery: validatedParams } = req;
    const user = req.user || null;

    //call the service function
    const posts = await getAllPosts(validatedParams, user);

    return res.status(200).json({
      success: true,
      message: `Found ${posts.blogPosts.length} blog posts`,
      data: posts.blogPosts,
      pagination: posts.pagination,
      filters: posts.appliedFilters,
    });
  } catch (error) {
    console.error("getAllPostsCtrl Error:", error.message);
    next(error);
  }
};

// //get all posts controller
// export const getAllPostsCtrl = async (req, res, next) => {
//   try {
//     // const { validatedQuery: query } = req;
//     const { validatedQuery: validatedParams } = req;

//     const user = req.user || null;

//     //decide if admin-level access should apply
//     const isAdmin =
//       user &&
//       (user.role === USER_TYPES.ADMIN || user.role === USER_TYPES.SUPERADMIN);
//     const userId = user ? user._id : null;

//     //call the service function
//     const posts = await getAllPosts(validatedParams, userId, isAdmin);

//     return res.status(200).json({
//       success: true,
//       message: `Found ${posts.blogPosts.length} blog posts`,
//       data: posts.blogPosts,
//       pagination: posts.pagination,
//       filters: posts.appliedFilters,
//     });
//   } catch (error) {
//     console.error("getAllPostsCtrl Error:", error.message);
//     next(error);
//   }
// };

//get post by ID or slug
export const getPostCtrl = async (req, res, next) => {
  try {
    const query = req.validatedQuery || req.validatedParams;
    const user = req.user || null;

    const post = await getPost(query, user);

    return res.status(200).json({
      success: true,
      message: "Blog post retrieved successfully",
      data: post,
    });
  } catch (error) {
    console.error("getPostCtrl Error:", error.message);
    next(error);
  }
};

//update post
export const updatePostCtrl = async (req, res, next) => {
  try {
    const { validatedBody: body } = req;
    if (!body) {
      return res.status(400).json({
        success: false,
        message:
          "Missing validated body. Check request format or validation middleware.",
      });
    }

    const { user } = req;
    const query = {
      _id: req.params.id,
    };
    const { file } = req;

    const updatedPost = await updatePost(query, body, file, user);

    return res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("updatePostCtrl Error:", error.message);
    next(error);
  }
};

export const deletePostCtrl = async (req, res) => {
  const query = {
    _id: req.params.id,
  };

  const delPost = await deletePost(query);

  return res.status(200).json({
    success: true,
    message: "Blog post deleted successfully",
    data: delPost,
  });
};
