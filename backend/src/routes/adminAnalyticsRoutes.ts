import { Router } from 'express';
import {
	getAdminAnalytics,
	updateAdminReportStatus,
} from '../controllers/admin_analytics';
import { requireAdmin, verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/', getAdminAnalytics);
router.patch('/reports/:id/status', updateAdminReportStatus);

export default router;
