export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type ReportTargetType = 'post' | 'user'
export type ResolveAction = 'remove_post' | 'hide_post' | 'ban_user' | 'dismiss'

export interface ReportItem {
  id: string
  reporter: { id: string; username: string; avatar_url: string | null }
  targetType: ReportTargetType
  targetPost?: {
    id: string
    content: string
    media: { url: string }[]
    status: 'active' | 'hidden' | 'removed'
  }
  targetUser: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  reason: string
  status: ReportStatus
  sameTargetReportCount: number
  created_at: string
}

export interface ReportListParams {
  page: number
  pageSize: number
  status?: ReportStatus
  targetType?: ReportTargetType
  reason?: string
  dateFrom?: string
  dateTo?: string
  reporterKeyword?: string
}

export interface ReportListResponse {
  items: ReportItem[]
  total: number
}

export interface ReportStats {
  pending: number
  reviewed: number
  dismissed: number
  today: number | null
}

export interface ReportDetail extends ReportItem {
  relatedReports: ReportItem[]
}

export interface ResolveReportPayload {
  action: ResolveAction
  reason?: string
}