import prisma from '../config/db';

const Post = {
    getbyId: async (id: string) => {
        return await prisma.posts.findUnique({
            where: { id },
            select: {
                id: true,
                user_id: true,
                content: true,
                created_at: true,
                updated_at: true,
            },
        });
    },
    getallpost:async()=>{
        return await prisma.posts.findMany({
            select:{
                id: true,
                user_id: true,
                content: true,
                created_at: true,
                updated_at: true,
            }
        })
    },
    getpostbyuserid: async (user_id: string) => {
        return await prisma.posts.findMany({
            where: { user_id },
            select: {
                id: true,
                user_id: true,
                content: true,
                created_at: true,
                updated_at: true,
            },
        });
    },
};

export default Post;