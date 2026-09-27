import api from './api';

//post------------------------
export const getpostById = (id: string) => {
  return api.get(`/posts/${id}`);
};
export const getAllPosts = () => {
  return api.get(`/posts/allPost`);
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
export const createPost = ( content: string) => {
  return api.post(`/posts/creatPost`, { content });
};


//comment---------------
export const postcomment = (post_id: string, content: string) => {
  return api.post(`/posts/${post_id}/comments`, { content });
};
export const getCommentsByPost = (post_id: string) => {
  return api.get(`/posts/${post_id}/comments`);
};

export default api;