import { reports_status } from '@prisma/client'
import type { Request, Response } from 'express'
import * as adminReportService from '../services/adminReportService'

type AuthenticatedRequest = Request & { user?: { id?: unknown } }

const getRouteParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const getQueryString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined

function parsePositiveInteger(value: unknown, fallback: number, maximum: number) {
  const raw = getQueryString(value)
  if (!raw) return fallback
  const parsed = Number(raw)
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) return null
  return parsed
}

function parseDate(value: unknown, endOfDay = false) {
  const raw = getQueryString(value)
  if (!raw) return undefined
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const parsed = new Date(`${raw}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw) return null
  return parsed
}

export async function listAdminReports(req: Request, res: Response) {
  const page = parsePositiveInteger(req.query.page, 1, Number.MAX_SAFE_INTEGER)
  const pageSize = parsePositiveInteger(req.query.pageSize, 10, 100)
  if (page === null || pageSize === null) {
    return res.status(400).json({ message: 'Số trang hoặc kích thước trang không hợp lệ.' })
  }

  const status = getQueryString(req.query.status)
  const targetType = getQueryString(req.query.targetType)
  const dateFrom = parseDate(req.query.dateFrom)
  const dateTo = parseDate(req.query.dateTo, true)
  if (status && !Object.values(reports_status).includes(status as reports_status)) {
    return res.status(400).json({ message: 'Trạng thái báo cáo không hợp lệ.' })
  }
  if (targetType && targetType !== 'post' && targetType !== 'user') {
    return res.status(400).json({ message: 'Loại đối tượng không hợp lệ.' })
  }
  if (dateFrom === null || dateTo === null || (dateFrom && dateTo && dateFrom > dateTo)) {
    return res.status(400).json({ message: 'Khoảng thời gian không hợp lệ.' })
  }

  try {
    const result = await adminReportService.listAdminReports({
      page,
      pageSize,
      ...(status ? { status: status as reports_status } : {}),
      ...(targetType ? { targetType: targetType as 'post' | 'user' } : {}),
      ...(getQueryString(req.query.reason) ? { reason: getQueryString(req.query.reason) } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      ...(getQueryString(req.query.reporterKeyword)
        ? { reporterKeyword: getQueryString(req.query.reporterKeyword) }
        : {}),
    })
    return res.status(200).json(result)
  } catch (error) {
    console.error('Error listing admin reports:', error)
    return res.status(500).json({ message: 'Không thể tải danh sách báo cáo.' })
  }
}

export async function getAdminReportStats(_req: Request, res: Response) {
  try {
    const stats = await adminReportService.getAdminReportStats()
    return res.status(200).json(stats)
  } catch (error) {
    console.error('Error fetching admin report stats:', error)
    return res.status(500).json({ message: 'Không thể tải thống kê báo cáo.' })
  }
}

export async function getAdminReportDetail(req: Request, res: Response) {
  const id = getRouteParam(req.params.id)
  if (!id) return res.status(400).json({ message: 'Thiếu mã báo cáo.' })

  try {
    const report = await adminReportService.getAdminReportDetail(id)
    return res.status(200).json(report)
  } catch (error) {
    if (error instanceof adminReportService.ReportNotFoundError) {
      return res.status(404).json({ message: error.message })
    }
    console.error('Error fetching admin report detail:', error)
    return res.status(500).json({ message: 'Không thể tải chi tiết báo cáo.' })
  }
}

export async function resolveAdminReport(req: Request, res: Response) {
  const id = getRouteParam(req.params.id)
  const body = req.body as { action?: unknown; reason?: unknown }
  const actions = ['remove_post', 'hide_post', 'ban_user', 'dismiss'] as const
  if (!id) return res.status(400).json({ message: 'Thiếu mã báo cáo.' })
  if (typeof body?.action !== 'string' || !actions.includes(body.action as typeof actions[number])) {
    return res.status(400).json({ message: 'Thao tác xử lý không hợp lệ.' })
  }
  if (body.reason !== undefined && typeof body.reason !== 'string') {
    return res.status(400).json({ message: 'Lý do xử lý không hợp lệ.' })
  }

  const adminId = (req as AuthenticatedRequest).user?.id
  if (typeof adminId !== 'string') return res.status(401).json({ message: 'Không xác định được quản trị viên.' })

  try {
    const report = await adminReportService.resolveAdminReport(id, adminId, {
      action: body.action as typeof actions[number],
      ...(typeof body.reason === 'string' ? { reason: body.reason } : {}),
    })
    return res.status(200).json(report)
  } catch (error) {
    if (error instanceof adminReportService.ReportNotFoundError) {
      return res.status(404).json({ message: error.message })
    }
    if (error instanceof adminReportService.ReportConflictError) {
      return res.status(409).json({ message: error.message })
    }
    if (error instanceof adminReportService.ReportInputError) {
      return res.status(400).json({ message: error.message })
    }
    console.error('Error resolving admin report:', error)
    return res.status(500).json({ message: 'Không thể xử lý báo cáo.' })
  }
}