import { reports_status } from '@prisma/client';
import { Request, Response } from 'express';
import * as adminAnalyticsService from '../services/adminAnalyticsService';

const getParam = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

export const getAdminAnalytics = async (_req: Request, res: Response) => {
	try {
		const analytics = await adminAnalyticsService.getAdminAnalytics();
		return res.status(200).json({ data: analytics });
	} catch (error) {
		console.error('Error fetching admin analytics:', error);
		return res.status(500).json({ message: 'Không thể tải dữ liệu thống kê' });
	}
};

export const updateAdminReportStatus = async (req: Request, res: Response) => {
	const id = getParam(req.params.id);
	const { status } = req.body as { status?: string };

	if (!id || !Object.values(reports_status).includes(status as reports_status)) {
		return res.status(400).json({ message: 'Trạng thái báo cáo không hợp lệ' });
	}

	try {
		const report = await adminAnalyticsService.updateAdminReportStatus(
			id,
			status as reports_status,
		);
		return res.status(200).json({ data: report });
	} catch (error) {
		if (
			typeof error === 'object'
			&& error !== null
			&& 'code' in error
			&& error.code === 'P2025'
		) {
			return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
		}

		console.error('Error updating admin report status:', error);
		return res.status(500).json({ message: 'Không thể cập nhật trạng thái báo cáo' });
	}
};
