import { Router } from 'express';
import {
    deleteAdminPost,
    getAdminPosts,
    updatePostStatus,
} from '../controllers/admin_post';

const router = Router();

router.get('/', getAdminPosts);
router.patch('/:id/status', updatePostStatus);
router.delete('/:id', deleteAdminPost);

export default router;
