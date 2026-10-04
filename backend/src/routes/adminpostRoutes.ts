import { Router } from 'express';
import {
    deleteAdminPost,
    findAdminPosts,
    getAdminPosts,
    updatePostStatus,
} from '../controllers/admin_post';
import { requireAdmin, verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/findpost', findAdminPosts);
router.get('/', getAdminPosts);
router.patch('/:id/status', updatePostStatus);
router.delete('/:id', deleteAdminPost);

export default router;
