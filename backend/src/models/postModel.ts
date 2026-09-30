import prisma from '../config/db';

const Post = {
    createPost: async (params: { user_id: string; content: string; visibility: 'public' | 'followers' | 'private' }) => {
        const { user_id, content, visibility } = params;

        const post = await prisma.posts.create({
            data: {
                user_id,
                content,
                visibility,
                status: 'active',
            },
            select: {
                id: true,
                user_id: true,
                parent_post_id: true,
                content: true,
                visibility: true,
                status: true,
                created_at: true,
            },
        });

        return post;
    },
    getPostOwner: async (post_id: string) => {
        return await prisma.posts.findUnique({
            where: { id: post_id },
            select: { user_id: true },
        });
    },
    createPostImage: async (post_id: string, url: string) => {
        return await prisma.media.create({
            data: {
                post_id,
                type: 'image',
                url,
            },
            select: {
                id: true,
                post_id: true,
                type: true,
                url: true,
                created_at: true,
            },
        });
    },
    getbyId: async (id: string) => {
        return await prisma.posts.findFirst({
            where: { id, parent_post_id: null },
            select: {
                id: true,
                user_id: true,
                content: true,
                visibility: true,
                created_at: true,
                updated_at: true,
            },
        });
    },
    getallpost: async () => {
        return await prisma.posts.findMany({
            where: {
                parent_post_id: null,
                status: 'active',
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
    searchPosts: async (keyword: string) => {
        return await prisma.posts.findMany({
            where: {
                parent_post_id: null,
                status: 'active',
                visibility: 'public',
                OR: [
                    { content: { contains: keyword } },
                    { post_hashtags: { some: { hashtags: { tag: { contains: keyword } } } } },
                ],
            },
            select: {
                id: true,
                user_id: true,
                content: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: { created_at: 'desc' },
            take: 20,
        });
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
    getRepliesByUserId: async (user_id: string) => {
        return await prisma.posts.findMany({
            where: {
                user_id,
                parent_post_id: { not: null },
                status: 'active',
            },
            select: {
                id: true,
                user_id: true,
                parent_post_id: true,
                content: true,
                created_at: true,
            },
            orderBy: { created_at: 'desc' },
        });
    },
    getLikedPostsByUserId: async (user_id: string) => {
        const likes = await prisma.likes.findMany({
            where: {
                user_id,
                posts: { is: { parent_post_id: null, status: 'active' } },
            },
            select: {
                posts: {
                    select: {
                        id: true,
                        user_id: true,
                        content: true,
                        created_at: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        return likes.map((like) => like.posts);
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
    updateVisibility: async (id: string, visibility: 'public' | 'followers' | 'private') => {
        return await prisma.posts.update({
            where: { id },
            data: { visibility },
            select: {
                id: true,
                user_id: true,
                visibility: true,
            },
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