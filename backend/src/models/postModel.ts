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
    getpictrbypost:async (post_id:string)=>{
        return await prisma.media.findMany({
            where:{post_id},
            select:{
                url:true,
            }
        })
    },
    updateStatus: async (id: string, status: 'active' | 'hidden' | 'removed') => {
        return await prisma.posts.update({
            where: { id },
            data: { status },
        });
    },
    delete: async (id: string) => {
        return await prisma.posts.delete({ where: { id } });
    },
};

export default Post;