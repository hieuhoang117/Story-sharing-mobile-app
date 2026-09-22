import prisma from '../config/db';

const Like = {
  create: prisma.likes.create,
  findUnique: prisma.likes.findUnique,
  getpostlike:async (id:string)=>{
    return await prisma.likes.findMany({
      where: {post_id: id},
      select:{
        id:true,
        user_id:true
      }
    })
  },
  delete: prisma.likes.delete,
};

export default Like;
