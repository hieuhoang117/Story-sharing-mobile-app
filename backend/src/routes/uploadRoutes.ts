import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { uploadAvatar, deleteAvatar } from '../controllers/uploadController';

const router = Router();

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);

export default router;