import Notification from '../models/notificationModel';

export const notificationTypes = ['like', 'reply', 'follow', 'mention', 'repost'] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const createNotification = async (data: {
  user_id: string;
  actor_id: string;
  type: NotificationType;
  post_id?: string;
}) => {
  return Notification.create({
    data: {
      user_id: data.user_id,
      actor_id: data.actor_id,
      type: data.type,
      post_id: data.post_id,
    },
    select: {
      id: true,
      user_id: true,
      actor_id: true,
      type: true,
      post_id: true,
      is_read: true,
      created_at: true,
    },
  });
};

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