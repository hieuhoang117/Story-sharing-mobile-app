import Like from '../models/likeModel';
import Post from '../models/postModel';

//post----------------------------------------
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


//like---------------------------------------------------
export const getlikesbypost=async (post_id:string)=>{
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