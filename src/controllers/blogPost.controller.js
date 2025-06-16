import { createPost, getAllPosts, getPost, updatePost, deletePost, incrementViews } from "../services/blogPost.service.js";
import { USER_TYPES, STATUS } from "../utils/user.js";

export const createPostCtrl = async (req, res) => {
  const { body } = req;
  const newPost = await createPost(body);
  return res.status(201).json({
    success: true,
    message: "Blog post created successfully",
    data: newPost,
  });
};

export const getAllPostsCtrl = async (req, res) => {
  const { status, tags, page, limit, sort, search } = req.query;
  const userType = req.user.role;

  //build query object
  const query = {};

  //always default status to published if the user is not an admin
  if (status && userType === USER_TYPES.ADMIN) {
    query.status = status;
  } else {
    query.status = STATUS.PUBLISHED
  };
  
  if (tags) query.tags = tags;

}

export const getPostCtrl = async (req, res) => {
  const { id, slug } = req.query;

  let query = {};
  if(id) query._id = id;
  if(slug) query.slug = slug;

  const post = await getPost(query);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
  }

  if (slug) {
    await incrementViews(query);
  }

  return res.status(200).json({
    success: true,
    message: "Blog post retrieved successfully",
    data: post,
  });
}