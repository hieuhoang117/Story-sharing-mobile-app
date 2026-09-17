import Post from '../models/postModel';

export const getPostById = async (id: string) => {
  return await Post.getbyId(id);
};

export const getPostByUserId = async (user_id: string) => {
  return await Post.getpostbyuserid(user_id);
};