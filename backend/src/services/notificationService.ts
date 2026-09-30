import Notification from '../models/notificationModel';

export const getNotificationsByUserId = async (userId: string, limit: number) => {
  return Notification.findMany({
    where: { user_id: userId },
    select: {
      id: true,
      type: true,
      post_id: true,
      is_read: true,
      created_at: true,
      users_notifications_actor_idTousers: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
        },
      },
      posts: {
        select: {
          id: true,
          user_id: true,
          content: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
};