import type { ImagePickerAsset } from 'expo-image-picker';
import api from './api';

export type PostVisibility = 'public' | 'followers' | 'private';

//post------------------------
export const getpostById = (id: string) => {
  return api.get(`/posts/${id}`);
};
export const getAllPosts = () => {
  return api.get(`/posts/allPost`);
};
export const searchPosts = (keyword: string) => {
  return api.get('/posts/search', { params: { keyword } });
};
export const getpicbypost = (post_id: string) => {
  return api.get(`/posts/getpostpic/${post_id}`);
};

//like---------------
export const getlikesbypost = (post_id: string) => {
  return api.get(`/posts/getlikebypost/${post_id}`);
};
export const createlike = (post_id: string) => {
  return api.post(`/posts/like/${post_id}`);
};
export const deletelike = (likeid: string) => {
  return api.delete(`/posts/deletelike/${likeid}`);
};
export const createPost = (content: string, visibility: PostVisibility = 'public') => {
  return api.post(`/posts/creatPost`, { content, visibility });
};
export const updatePostVisibility = (postId: string, visibility: PostVisibility) => {
  return api.patch(`/posts/${postId}/visibility`, { visibility });
};
export const deletePost = (postId: string) => {
  return api.delete(`/posts/${postId}`);
};

export const uploadPostImage = (postId: string, image: ImagePickerAsset) => {
  const formData = new FormData();
  formData.append('image', {
    uri: image.uri,
    name: image.fileName ?? 'post-image.jpg',
    type: image.mimeType ?? 'image/jpeg',
  } as unknown as Blob);

  return api.post(`/posts/${postId}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};


//comment---------------
export const postcomment = (post_id: string, content: string) => {
  return api.post(`/posts/${post_id}/comments`, { content });
};
export const getCommentsByPost = (post_id: string) => {
  return api.get(`/posts/${post_id}/comments`);
};




export default api;