import { Form, message, Typography } from 'antd'
import { isCancel } from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contextAdmin/AuthContext'
import './adminrepost.css'
import type {
    ReportFilterFormValues,
    ResolveActionModalHandle,
} from './moderationComponents'
import {
    ReportDetailDrawer,
    ReportFilters,
    ReportStatsCards,
    ReportTable,
    ResolveActionModal,
} from './moderationComponents'
import {
    fetchReportDetail,
    fetchReports,
    fetchReportStats,
    resolveReport,
} from './reportsApi'
import type {
    ReportDetail,
    ReportListParams,
    ReportStats,
    ReportStatus,
    ResolveAction,
} from './reportsTypes'

dayjs.locale('vi')

const { Title, Paragraph, Text } = Typography

const initialParams: ReportListParams = { page: 1, pageSize: 10, status: 'pending' }

function isAbortError(error: unknown) {
	return isCancel(error) || (error instanceof DOMException && error.name === 'AbortError')
}

export default function AdminReport() {
	const { token } = useAuth()
	const [filterForm] = Form.useForm<ReportFilterFormValues>()
	const [reports, setReports] = useState<ReportDetail['relatedReports']>([])
	const [total, setTotal] = useState(0)
	const [params, setParams] = useState<ReportListParams>(initialParams)
	const [tableLoading, setTableLoading] = useState(true)
	const [stats, setStats] = useState<ReportStats>({ pending: 0, reviewed: 0, dismissed: 0, today: null })
	const [statsLoading, setStatsLoading] = useState(true)
	const [reloadKey, setReloadKey] = useState(0)
	const [detailOpen, setDetailOpen] = useState(false)
	const [detailLoading, setDetailLoading] = useState(false)
	const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null)
	const [resolving, setResolving] = useState(false)
	const detailControllerRef = useRef<AbortController | null>(null)
	const modalRef = useRef<ResolveActionModalHandle>(null)
	const resolvingRef = useRef(false)

	useEffect(() => {
		const controller = new AbortController()
		const load = async () => {
			try {
				const response = await fetchReports(token, params, controller.signal)
				if (controller.signal.aborted) return
				setReports(response.items)
				setTotal(response.total)
			} catch (error) {
				if (!controller.signal.aborted && !isAbortError(error)) message.error('Không thể tải danh sách báo cáo.')
			} finally {
				if (!controller.signal.aborted) setTableLoading(false)
			}
		}

		void load()
		return () => controller.abort()
	}, [params, reloadKey, token])

	useEffect(() => {
		const controller = new AbortController()
		const load = async () => {
			try {
				const response = await fetchReportStats(token, controller.signal)
				if (!controller.signal.aborted) setStats(response)
			} catch (error) {
				if (!controller.signal.aborted && !isAbortError(error)) message.error('Không thể tải thống kê báo cáo.')
			} finally {
				if (!controller.signal.aborted) setStatsLoading(false)
			}
		}

		void load()
		return () => controller.abort()
	}, [reloadKey, token])

	useEffect(() => () => detailControllerRef.current?.abort(), [])

	const submitFilters = useCallback((values: ReportFilterFormValues) => {
		const [dateFrom, dateTo] = values.dateRange ?? []
		const nextParams: ReportListParams = {
			page: 1,
			pageSize: params.pageSize,
			...(values.status && values.status !== 'all' ? { status: values.status } : {}),
			...(values.targetType && values.targetType !== 'all' ? { targetType: values.targetType } : {}),
			...(values.reason ? { reason: values.reason } : {}),
			...(dateFrom ? { dateFrom: dateFrom.format('YYYY-MM-DD') } : {}),
			...(dateTo ? { dateTo: dateTo.format('YYYY-MM-DD') } : {}),
			...(values.reporterKeyword?.trim() ? { reporterKeyword: values.reporterKeyword.trim() } : {}),
		}
		setTableLoading(true)
		setParams(nextParams)
	}, [params.pageSize])

	const resetFilters = useCallback(() => {
		filterForm.resetFields()
		filterForm.setFieldsValue({ status: 'pending', targetType: 'all' })
		setTableLoading(true)
		setParams(initialParams)
	}, [filterForm])

	const selectStatFilter = useCallback((filter: ReportStatus | 'today') => {
		if (filter === 'today') {
			const today = dayjs()
			filterForm.setFieldsValue({ status: 'all', dateRange: [today, today] })
			setTableLoading(true)
			setParams((current) => ({
				...current,
				page: 1,
				dateFrom: today.format('YYYY-MM-DD'),
				dateTo: today.format('YYYY-MM-DD'),
				status: undefined,
			}))
			return
		}

		filterForm.setFieldsValue({ status: filter, dateRange: null })
		setTableLoading(true)
		setParams((current) => ({ ...current, page: 1, status: filter, dateFrom: undefined, dateTo: undefined }))
	}, [filterForm])

	const changePage = useCallback((page: number, pageSize: number) => {
		setTableLoading(true)
		setParams((current) => ({ ...current, page, pageSize }))
	}, [])

	const openReportDetail = useCallback(async (report: ReportDetail['relatedReports'][number]) => {
		detailControllerRef.current?.abort()
		const controller = new AbortController()
		detailControllerRef.current = controller
		setSelectedReport({ ...report, relatedReports: [] })
		setDetailOpen(true)
		setDetailLoading(true)
		try {
			const detail = await fetchReportDetail(token, report.id, controller.signal)
			if (!controller.signal.aborted) {
				setSelectedReport(detail)
			}
		} catch (error) {
			if (!controller.signal.aborted && !isAbortError(error)) message.error('Không thể tải chi tiết báo cáo.')
		} finally {
			if (!controller.signal.aborted) setDetailLoading(false)
		}
	}, [token])

	const closeDetail = useCallback(() => {
		detailControllerRef.current?.abort()
		setDetailOpen(false)
	}, [])

	const confirmResolve = useCallback(async (action: ResolveAction, reason?: string) => {
		if (!selectedReport || resolvingRef.current) return
		resolvingRef.current = true
		setResolving(true)
		try {
			await resolveReport(token, selectedReport.id, {
				action,
				...(reason ? { reason } : {}),
			})
			message.success('Đã xử lý báo cáo thành công.')
			setDetailOpen(false)
			setTableLoading(true)
			setStatsLoading(true)
			setReloadKey((current) => current + 1)
		} catch (error) {
			message.error('Không thể xử lý báo cáo. Vui lòng thử lại.')
			throw error
		} finally {
			resolvingRef.current = false
			setResolving(false)
		}
	}, [selectedReport, token])

	return (
		<main className="moderation-page">
			<header className="moderation-heading">
				<div>
					<Text className="moderation-eyebrow">AN TOÀN CỘNG ĐỒNG</Text>
					<Title level={2}>Quản lý vi phạm</Title>
					<Paragraph>Tiếp nhận và xử lý báo cáo từ cộng đồng StoryShare.</Paragraph>
				</div>
			</header>

			<ReportStatsCards stats={stats} loading={statsLoading} onSelect={selectStatFilter} />
			<ReportFilters form={filterForm} onSearch={submitFilters} onReset={resetFilters} />
			<ReportTable
				items={reports}
				total={total}
				page={params.page}
				pageSize={params.pageSize}
				loading={tableLoading}
				onPageChange={changePage}
				onOpenDetail={openReportDetail}
			/>
			<ReportDetailDrawer
				open={detailOpen}
				loading={detailLoading}
				report={selectedReport}
				resolving={resolving}
				onClose={closeDetail}
				onResolve={(action) => modalRef.current?.confirm(action)}
			/>
			<ResolveActionModal ref={modalRef} onConfirm={confirmResolve} />
		</main>
	)
}