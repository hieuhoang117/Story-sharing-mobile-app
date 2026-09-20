import Post from '../models/postModel';

export const getPostById = async (id: string) => {
  return await Post.getbyId(id);
};

export const getPostByUserId = async (user_id: string) => {
  return await Post.getpostbyuserid(user_id);
};
export const getallpost=async()=>{
  return await Post.getallpost();
};
export const getpostpic=async (post_id:string)=>{
  return await Post.getpictrbypost(post_id);
}