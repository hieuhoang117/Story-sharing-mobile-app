import { Router } from 'express';
import { getNotificationsByUserId } from '../controllers/notificationController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:userId', verifyToken, getNotificationsByUserId);

export default router;