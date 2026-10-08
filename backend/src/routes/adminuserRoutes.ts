import { Router } from 'express';
import {
    deleteAdminUser,
    findAdminUsers,
    getAdminUserById,
    getAdminUsers,
    updateUserRole,
    updateUserStatus,
} from '../controllers/admin_user';
import { requireAdmin, verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/find', findAdminUsers);
router.get('/', getAdminUsers);
router.get('/:id', getAdminUserById);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteAdminUser);

export default router;
