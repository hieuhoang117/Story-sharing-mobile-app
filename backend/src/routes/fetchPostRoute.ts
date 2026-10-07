import { Router } from 'express';
import { getFeed } from '../controllers/fetchpostController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/feed', verifyToken, getFeed);

export default router;