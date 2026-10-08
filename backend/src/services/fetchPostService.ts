import prisma from '../config/db';

// Fisher-Yates shuffle (random đều, tốt hơn sort(() => Math.random() - 0.5))
const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const postInclude = {
  users: {
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
    },
  },
  media: true,
};

export const getFollowingFeed = async (userId: string) => {
  // 1. Lấy danh sách người đang follow (đã accepted)
  const following = await prisma.follows.findMany({
    where: { follower_id: userId, status: 'accepted' },
    select: { following_id: true },
  });
  const followingIds = following.map((f) => f.following_id);

  // 2. Lấy song song: bài nổi bật + bài của người follow 
  const [famousPosts, followingPosts] = await Promise.all([
    prisma.posts.findMany({
      where: {
        status: 'active',
        parent_post_id: null,
        like_count: { gte: 50 },
        reply_count: { gte: 10 },
        user_id: { not: userId },
        repost_count: { gte: 5 },
      },
      orderBy: { like_count: 'desc' },
      take: 50, // lấy dư ra rồi mới random, để mỗi lần load khác nhau
      include: postInclude,
    }),
    prisma.posts.findMany({
      where: {
        user_id: { in: [...followingIds] },
        status: 'active',
        parent_post_id: null,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: postInclude,
    }),
  ]);

  // 3. Gộp và loại trùng (một bài có thể vừa nổi bật vừa của người follow)
  const merged = new Map<string, (typeof famousPosts)[number]>();
  for (const post of [...famousPosts, ...followingPosts]) {
    merged.set(String(post.id), post);
  }

  // 4. Shuffle và trả về 50 bài
  return shuffle([...merged.values()]).slice(0, 50);
};