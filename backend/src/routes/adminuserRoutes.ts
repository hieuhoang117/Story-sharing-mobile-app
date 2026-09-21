import { Router } from 'express';
import {
    deleteAdminUser,
    getAdminUserById,
    getAdminUsers,
    updateUserRole,
    updateUserStatus,
} from '../controllers/admin_user';

const router = Router();

router.get('/', getAdminUsers);
router.get('/:id', getAdminUserById);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteAdminUser);

export default router;
