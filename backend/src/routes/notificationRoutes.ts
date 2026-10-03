import { Router } from 'express';
import { createNotification, getNotificationsByUserId, markNotificationAsRead } from '../controllers/notificationController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', verifyToken, createNotification);
router.patch('/:id/read', verifyToken, markNotificationAsRead);
router.get('/:userId', verifyToken, getNotificationsByUserId);

export default router;