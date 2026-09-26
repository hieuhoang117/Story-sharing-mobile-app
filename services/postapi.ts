import { api } from './api';
//post------------------------
export const getpostById = (id: string) => {
  return api.get(`/posts/${id}`);
}
export const getAllPosts = () => {
  return api.get(`/posts/allPost`)
}
export const getpicbypost = (post_id: string) => {
  return api.get(`/posts/getpostpic/${post_id}`);
}

//like---------------
export const getlikesbypost = (post_id: string) => {
  return api.get(`/posts/getlikebypost/${post_id}`)
}
export const createlike = (post_id: string, user_id: string) => {
  return api.post(`/posts/like/${post_id}`, { user_id })
}
export const deletelike = (likeid: string) => {
  return api.delete(`/posts/deletelike/${likeid}`)
}
export const postcomment = (post_id: string, content: string, user_id: string) => {
  return api.post(`/posts/comment/${post_id}`, { content, user_id })
}
export const getCommentsByPost = (post_id: string) => {
  return api.get(`/posts/${post_id}/comments`);
};

export default api;