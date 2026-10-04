import Like from '../models/likeModel';
import Post from '../models/postModel';

export type PostVisibility = 'public' | 'followers' | 'private';

//post----------------------------------------
export const getPostById = async (id: string) => {
  return await Post.getbyId(id);
};
export const updatePostVisibility = async (id: string, visibility: PostVisibility) => {
  return await Post.updateVisibility(id, visibility);
};
export const updatePostStatus = async (id: string, status: 'active' | 'hidden' | 'removed') => {
  return await Post.updateStatus(id, status);
};

export const getPostByUserId = async (user_id: string) => {
  return await Post.getpostbyuserid(user_id);
};
export const getRepliesByUserId = async (user_id: string) => {
  return await Post.getRepliesByUserId(user_id);
};
export const getLikedPostsByUserId = async (user_id: string) => {
  return await Post.getLikedPostsByUserId(user_id);
};
export const getallpost = async (userId: string) => {
  return await Post.getallpost(userId);
};
export const searchPosts = async (keyword: string) => {
  return await Post.searchPosts(keyword);
};
export const getpostpic = async (post_id: string) => {
  return await Post.getpictrbypost(post_id);
}

export const createComment = async (post_id: string, user_id: string, content: string) => {
  return await Post.createComment({
    user_id,
    parent_post_id: post_id,
    content,
  });
};

export const createPost = async (user_id: string, content: string, visibility: PostVisibility) => {
  return await Post.createPost({
    user_id,
    content,
    visibility,
  });
};

export const getPostOwner = async (post_id: string) => {
  return await Post.getPostOwner(post_id);
};

export const createPostImage = async (post_id: string, url: string) => {
  return await Post.createPostImage(post_id, url);
};

export const getCommentsByPost = async (post_id: string) => {
  return await Post.getCommentsByPostId(post_id);   
};


//like---------------------------------------------------
export const getlikesbypost = async (post_id: string) => {
  return await Like.getpostlike(post_id);
};

export const createLike = async (user_id: string, post_id: string) => {
  return await Like.create({
    data: {
      user_id,
      post_id,
    },
  });
};
export const deletelike = async (id: string) => {
  return await Like.delete({
    where: { id },
  });
};