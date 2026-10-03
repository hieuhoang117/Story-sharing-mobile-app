import { Router } from 'express';
import { deleteAvatar, uploadAvatar } from '../controllers/uploadController';
import { verifyToken } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', verifyToken, deleteAvatar);

export default router;