import { Router } from 'express'
import {
    getAdminReportDetail,
    getAdminReportStats,
    listAdminReports,
    resolveAdminReport,
} from '../controllers/adminReportsController'
import { requireAdmin, verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.use(verifyToken, requireAdmin)
router.get('/stats', getAdminReportStats)
router.get('/', listAdminReports)
router.get('/:id', getAdminReportDetail)
router.post('/:id/resolve', resolveAdminReport)

export default router