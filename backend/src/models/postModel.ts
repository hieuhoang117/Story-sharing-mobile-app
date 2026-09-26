import prisma from '../config/db';

const Post = {
    getbyId: async (id: string) => {
        return await prisma.posts.findFirst({
            where: { id, parent_post_id: null },
            select: {
                id: true,
                user_id: true,
                content: true,
                created_at: true,
                updated_at: true,
            },
        });
    },
    getallpost: async () => {
        return await prisma.posts.findMany({
            where: {
                parent_post_id: null,   // chỉ lấy post gốc, loại bỏ comment
                status: 'active',        // nên thêm luôn, tránh hiện post đã bị ẩn/xóa
            },
            select: {
                id: true,
                user_id: true,
                content: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: { created_at: 'desc' },   // nên thêm, để post mới nhất hiện lên đầu
        })
    },
    getpostbyuserid: async (user_id: string) => {
        return await prisma.posts.findMany({
            where: {
                user_id,
                parent_post_id: null,
            },
            select: {
                id: true,
                user_id: true,
                content: true,
                created_at: true,
                updated_at: true,
            },
        });
    },
    getpictrbypost: async (post_id: string) => {
        return await prisma.media.findMany({
            where: { post_id },
            select: {
                url: true,
            }
        })
    },
    updateStatus: async (id: string, status: 'active' | 'hidden' | 'removed') => {
        return await prisma.posts.update({
            where: { id },
            data: { status },
        });
    },
    createComment: async (params: { user_id: string; parent_post_id: string; content: string }) => {
        const { user_id, parent_post_id, content } = params;

        return await prisma.$transaction(async (tx) => {
            const comment = await tx.posts.create({
                data: {
                    user_id,
                    parent_post_id,
                    content,
                    visibility: 'public',
                },
                select: {
                    id: true,
                    user_id: true,
                    parent_post_id: true,
                    content: true,
                    status: true,
                    created_at: true,
                },
            });

            await tx.posts.update({
                where: { id: parent_post_id },
                data: { reply_count: { increment: 1 } },
            });

            return comment;
        });
    },

    // Lấy danh sách comment của 1 bài viết, kèm thông tin người viết
    getCommentsByPostId: async (post_id: string) => {
        return await prisma.posts.findMany({
            where: {
                parent_post_id: post_id,
                status: 'active',
            },
            select: {
                id: true,
                user_id: true,
                content: true,
                like_count: true,
                created_at: true,
                users: {
                    select: {
                        username: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
            },
            orderBy: { created_at: 'asc' },
        });
    },
    delete: async (id: string) => {
        return await prisma.posts.delete({ where: { id } });
    },
};

export default Post;