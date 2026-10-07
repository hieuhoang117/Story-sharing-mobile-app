import prisma from '../config/db';

export const getFollowingFeed = async (userId: string) => {
  // 1. Lấy danh sách người mà user đang follow (trạng thái đã accepted)
  const following = await prisma.follows.findMany({
    where: {
      follower_id: userId,
      status: 'accepted',
    },
    select: { following_id: true },
  });

  const followingIds = following.map(f => f.following_id);

  // 2. Lấy bài viết của những người đó + của chính user, chỉ lấy bài đang active
  const posts = await prisma.posts.findMany({
    where: {
      user_id: { in: [...followingIds, userId] },
      status: 'active',
      parent_post_id: null, // chỉ lấy bài gốc, không lấy reply (tuỳ bạn muốn hiện reply trong feed không)
    },
    orderBy: { created_at: 'desc' },
    take: 20,
    include: {
      users: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
        },
      },
      media: true,
    },
  });

  return posts;
};