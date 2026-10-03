import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';
import * as postService from '../services/postService';
import * as userService from '../services/userService';

export const createNotification = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const userId = typeof body.user_id === 'string' ? body.user_id.trim() : '';
    const type = body.type;
    const postId = body.post_id;

    if (!userId || typeof type !== 'string' || !notificationService.notificationTypes.includes(type as notificationService.NotificationType)) {
      return res.status(400).json({ message: 'user_id and a valid type are required' });
    }
    if (postId !== undefined && postId !== null && (typeof postId !== 'string' || !postId.trim())) {
      return res.status(400).json({ message: 'post_id must be a non-empty string' });
    }

    const recipient = await userService.getUserById(userId);
    if (!recipient) {
      return res.status(404).json({ message: 'Notification recipient not found' });
    }

    const normalizedPostId = typeof postId === 'string' ? postId.trim() : undefined;
    if (normalizedPostId && !(await postService.getPostById(normalizedPostId))) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const notification = await notificationService.createNotification({
      user_id: userId,
      actor_id: (req as any).user.id as string,
      type: type as notificationService.NotificationType,
      post_id: normalizedPostId,
    });

    return res.status(201).json({ data: notification });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating notification', error });
  }
};

export const getNotificationsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const authenticatedUserId = (req as any).user.id as string;

    if (userId !== authenticatedUserId) {
      return res.status(403).json({ message: 'You can only view your own notifications' });
    }

    const requestedLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50;
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;
    const notifications = await notificationService.getNotificationsByUserId(userId, limit);

    return res.status(200).json({ data: notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!notificationId) {
      return res.status(400).json({ message: 'Notification id is required' });
    }

    const userId = (req as any).user.id as string;
    const result = await notificationService.markNotificationAsRead(notificationId, userId);
    if (result.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      data: { id: notificationId, is_read: 1 },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error marking notification as read', error });
  }
};