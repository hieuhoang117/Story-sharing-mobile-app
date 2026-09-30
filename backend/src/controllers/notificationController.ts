import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

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