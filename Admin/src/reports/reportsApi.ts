import axios from 'axios'
import type {
    ReportDetail,
    ReportListParams,
    ReportListResponse,
    ReportStats,
    ResolveReportPayload,
} from './reportsTypes'

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

function getRequestConfig(token: string | null, signal?: AbortSignal) {
  if (!token) throw new Error('Vui lòng đăng nhập lại để tiếp tục.')
  return { headers: { Authorization: `Bearer ${token}` }, signal }
}

export async function fetchReports(
  token: string | null,
  params: ReportListParams,
  signal?: AbortSignal,
): Promise<ReportListResponse> {
  const response = await axios.get<ReportListResponse>(`${API_BASE_URL}/admin/reports`, {
    ...getRequestConfig(token, signal),
    params,
  })
  return response.data
}

export async function fetchReportStats(token: string | null, signal?: AbortSignal): Promise<ReportStats> {
  const response = await axios.get<ReportStats>(`${API_BASE_URL}/admin/reports/stats`, getRequestConfig(token, signal))
  return response.data
}

export async function fetchReportDetail(
  token: string | null,
  id: string,
  signal?: AbortSignal,
): Promise<ReportDetail> {
  const response = await axios.get<ReportDetail>(
    `${API_BASE_URL}/admin/reports/${encodeURIComponent(id)}`,
    getRequestConfig(token, signal),
  )
  return response.data
}

export async function resolveReport(
  token: string | null,
  id: string,
  payload: ResolveReportPayload,
  signal?: AbortSignal,
): Promise<ReportDetail> {
  const response = await axios.post<ReportDetail>(
    `${API_BASE_URL}/admin/reports/${encodeURIComponent(id)}/resolve`,
    payload,
    getRequestConfig(token, signal),
  )
  return response.data
}