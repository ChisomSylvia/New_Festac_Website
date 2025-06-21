import {
  USER_TYPES
} from "../configs/constants.config.js";
import {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost
} from "../services/blogPost.service.js";
import {
  handleImageUpdate,
  // formatCloudinaryFile
} from "../services/file.service.js";


//create blog post
export const createPostCtrl = async (req, res, next) => {
  try {
    const { body } = req;
    const { file } = req;
  
    // console.log("Tags:", body.tags);
  
    //transform tags string to array if type is string
    if (typeof body.tags === "string") {
      body.tags = body.tags.split(",").map(tag => tag.trim());
    };
  
    const newBlogPost = await createPost(body, file);
  
    return res.status(201).json({
      success: true,
      message: newBlogPost.message,
      data: newBlogPost.data,
    });
    
  } catch (error) {
    next(error);
    // console.log("Service Error", err.message);
    // return res.status(500).json({
    //   success: fasle,
    //   message: newBlogPost.message,
    // });
  }
};


export const getAllPostsCtrl = async (req, res, next) => {
  try {
    const validatedParams = req.query;
    const user = req.user || null;
    console.log("Validated Params", validatedParams);
    
    //decide if admin-level access should apply
    // const isAdmin = user && [USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN].includes(user.role);
    const isAdmin = user && (user.role === USER_TYPES.ADMIN || user.role === USER_TYPES.SUPERADMIN);
    const userId = user ? user._id : null;
    console.log("User Id", userId);
    
    //transform tags string to array if type is string
    if (typeof validatedParams.tags === "string") {
      validatedParams.tags = validatedParams.tags.split(",").map(tag => tag.trim());
    };

    Object.defineProperty(req, "query", {
      set() {
        throw new Error ("Attempted to reassign req.query")
      }
    })
  
    console.log("query type", typeof req.query);
    console.log("query", req.query);
    
    const posts = await getAllPosts(validatedParams, userId, isAdmin);
  
    return res.status(200).json({
      success: true,
      message: `Found ${posts.blogPosts.length} blog posts`,
      data: posts.blogPosts,
      pagination: posts.pagination,
      filters: posts.appliedFilters,
    });
    
  } catch (error) {
    next(error);
  }
}


export const getPostCtrl = async (req, res) => {
  const {
    query
  } = req;

  const post = await getPost(query);

  return res.status(200).json({
    success: true,
    message: "Blog post retrieved successfully",
    data: post,
  });
}


export const updatePostCtrl = async (req, res) => {
  const {
    body
  } = req;
  const query = {
    _id: req.params.id
  };

  const existingPost = await getPost(query);
  if (!existingPost) {
    return res.status(404).json({
      success: false,
      message: "Post not found"
    })
  }
  // const public_id = existingPost.featuredImage?.publicId;

  //delete old image if new one is being uploaded
  const featuredImage = await handleImageUpdate(req.file, existingPost.featuredImage);


  // if (req.file && public_id) {
  //   await deleteImage(public_id)
  // }

  // const featuredImage = req.file 
  // ? formatCloudinaryFile(req.file)
  // : existingPost.featuredImage;

  const updatedPost = await updatePost(query, {
    ...body,
    featuredImage
  });

  return res.status(200).json({
    success: true,
    message: "Blog post updated successfully",
    data: updatedPost,
  });
}


export const deletePostCtrl = async (req, res) => {
  const query = {
    _id: req.params.id
  };

  const delPost = await deletePost(query);

  return res.status(200).json({
    success: true,
    message: "Blog post deleted successfully",
    data: delPost,
  });
}