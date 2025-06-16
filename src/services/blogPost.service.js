import BlogPostModel from "../models/blogPost.model.js";

export const createPost = async (data) => {
  const newBlogPost = await BlogPostModel.create(data);
  return newBlogPost;
};

export const getAllPosts = async (query) => {
  const blogPosts = await BlogPostModel.find(query);
  return blogPosts;
};

export const getPost = async (query) => {
  const blogPost = await BlogPostModel.findOne(query);
  return blogPost;
};

export const updatePost = async (query, data) => {
  const updatedBlogPost = await BlogPostModel.findOneAndUpdate(query, data, { new: true });
  return updatedBlogPost;
};

export const deletePost = async (query) => {
  const delBlogPost = await BlogPostModel.findOneAndDelete(query);
  return delBlogPost;
};

export const incrementViews = async (query) => {
  const updatedBlogPost = await BlogPostModel.findOneAndUpdate(query, { $inc: { views: 1} }, { new: true });
  return updatedBlogPost;
};