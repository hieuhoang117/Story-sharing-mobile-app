import { Router } from 'express';
import { createNotification, getNotificationsByUserId } from '../controllers/notificationController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', verifyToken, createNotification);
router.get('/:userId', verifyToken, getNotificationsByUserId);

export default router;