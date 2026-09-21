import { api } from './api';

export const getpostById = (id: string) => {
  return api.get(`/posts/${id}`);
}
export const getAllPosts=()=>{
  return api.get(`/posts/allPost`)
}
export const getpicbypost=(post_id:string)=>{
  return api.get(`/posts/getpostpic/${post_id}`);
}



export default api;