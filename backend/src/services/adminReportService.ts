import { posts_status, reports_status, users_status, type Prisma } from '@prisma/client'
import prisma from '../config/db'

export type AdminReportFilters = {
  page: number
  pageSize: number
  status?: reports_status
  targetType?: 'post' | 'user'
  reason?: string
  dateFrom?: Date
  dateTo?: Date
  reporterKeyword?: string
}

export type ResolveReportPayload = {
  action: 'remove_post' | 'hide_post' | 'ban_user' | 'dismiss'
  reason?: string
}

export class ReportNotFoundError extends Error {}
export class ReportConflictError extends Error {}
export class ReportInputError extends Error {}

const reportInclude = {
  users_reports_reporter_idTousers: {
    select: { id: true, username: true, avatar_url: true },
  },
  users_reports_reported_user_idTousers: {
    select: { id: true, username: true, display_name: true, avatar_url: true },
  },
  posts: {
    include: {
      users: { select: { id: true, username: true, display_name: true, avatar_url: true } },
      media: { select: { url: true }, orderBy: { order_index: 'asc' as const } },
    },
  },
} satisfies Prisma.reportsInclude

type ReportWithRelations = Prisma.reportsGetPayload<{ include: typeof reportInclude }>

const targetKey = (postId: string | null, userId: string | null) =>
  postId ? `post:${postId}` : `user:${userId ?? ''}`

const mapReport = (report: ReportWithRelations, sameTargetReportCount: number) => {
  const targetUser = report.post_id
    ? report.posts?.users
    : report.users_reports_reported_user_idTousers

  if (!targetUser) throw new ReportInputError('Báo cáo không còn đối tượng hợp lệ.')

  return {
    id: report.id,
    reporter: report.users_reports_reporter_idTousers,
    targetType: report.post_id ? 'post' as const : 'user' as const,
    ...(report.posts ? {
      targetPost: {
        id: report.posts.id,
        content: report.posts.content ?? '',
        media: report.posts.media,
        status: report.posts.status,
      },
    } : {}),
    targetUser,
    reason: report.reason,
    status: report.status,
    sameTargetReportCount,
    created_at: report.created_at.toISOString(),
  }
}

async function getTargetCountMap(reports: ReportWithRelations[]) {
  const postIds = [...new Set(reports.flatMap((report) => report.post_id ? [report.post_id] : []))]
  const userIds = [...new Set(reports.flatMap((report) => !report.post_id && report.reported_user_id ? [report.reported_user_id] : []))]
  const countMap = new Map<string, number>()

  if (postIds.length) {
    const groups = await prisma.reports.groupBy({
      by: ['post_id'],
      where: { post_id: { in: postIds } },
      _count: { _all: true },
    })
    groups.forEach((group) => {
      if (group.post_id) countMap.set(targetKey(group.post_id, null), group._count._all)
    })
  }

  if (userIds.length) {
    const groups = await prisma.reports.groupBy({
      by: ['reported_user_id'],
      where: { post_id: null, reported_user_id: { in: userIds } },
      _count: { _all: true },
    })
    groups.forEach((group) => {
      if (group.reported_user_id) countMap.set(targetKey(null, group.reported_user_id), group._count._all)
    })
  }

  return countMap
}

function buildWhere(filters: Omit<AdminReportFilters, 'page' | 'pageSize'>): Prisma.reportsWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.targetType === 'post' ? { post_id: { not: null } } : {}),
    ...(filters.targetType === 'user' ? { post_id: null, reported_user_id: { not: null } } : {}),
    ...(filters.reason ? { reason: filters.reason } : {}),
    ...(filters.dateFrom || filters.dateTo ? {
      created_at: {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      },
    } : {}),
    ...(filters.reporterKeyword ? {
      users_reports_reporter_idTousers: {
        username: { contains: filters.reporterKeyword },
      },
    } : {}),
  }
}

export async function listAdminReports(filters: AdminReportFilters) {
  const where = buildWhere(filters)
  const [reports, total] = await Promise.all([
    prisma.reports.findMany({
      where,
      include: reportInclude,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.reports.count({ where }),
  ])
  const countMap = await getTargetCountMap(reports)

  return {
    items: reports.map((report) => mapReport(
      report,
      countMap.get(targetKey(report.post_id, report.reported_user_id)) ?? 0,
    )),
    total,
  }
}

export async function getAdminReportStats() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const [statusGroups, today] = await Promise.all([
    prisma.reports.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.reports.count({ where: { created_at: { gte: startOfToday } } }),
  ])
  const getCount = (status: reports_status) =>
    statusGroups.find((group) => group.status === status)?._count._all ?? 0

  return {
    pending: getCount(reports_status.pending),
    reviewed: getCount(reports_status.reviewed),
    dismissed: getCount(reports_status.dismissed),
    today,
  }
}

export async function getAdminReportDetail(id: string) {
  const report = await prisma.reports.findUnique({ where: { id }, include: reportInclude })
  if (!report) throw new ReportNotFoundError('Không tìm thấy báo cáo.')

  const relatedWhere: Prisma.reportsWhereInput = report.post_id
    ? { post_id: report.post_id }
    : { post_id: null, reported_user_id: report.reported_user_id }
  const [related, sameTargetReportCount] = await Promise.all([
    prisma.reports.findMany({
      where: { ...relatedWhere, id: { not: report.id } },
      include: reportInclude,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: 20,
    }),
    prisma.reports.count({ where: relatedWhere }),
  ])

  const countMap = await getTargetCountMap([report, ...related])
  return {
    ...mapReport(report, sameTargetReportCount),
    relatedReports: related.map((item) => mapReport(
      item,
      countMap.get(targetKey(item.post_id, item.reported_user_id)) ?? sameTargetReportCount,
    )),
  }
}

export async function resolveAdminReport(id: string, adminId: string, payload: ResolveReportPayload) {
  if ((payload.action === 'remove_post' || payload.action === 'ban_user') && !payload.reason?.trim()) {
    throw new ReportInputError('Vui lòng nhập lý do xử lý.')
  }

  const reason = payload.reason?.trim()
  if (reason && reason.length > 255) throw new ReportInputError('Lý do xử lý không được vượt quá 255 ký tự.')

  await prisma.$transaction(async (transaction) => {
    const report = await transaction.reports.findUnique({
      where: { id },
      select: { id: true, status: true, post_id: true, reported_user_id: true },
    })
    if (!report) throw new ReportNotFoundError('Không tìm thấy báo cáo.')
    if (report.status !== reports_status.pending) {
      throw new ReportConflictError('Báo cáo này đã được xử lý trước đó.')
    }

    if (payload.action === 'hide_post' || payload.action === 'remove_post') {
      if (!report.post_id) throw new ReportInputError('Báo cáo này không thuộc về bài viết.')
      await transaction.posts.update({
        where: { id: report.post_id },
        data: {
          status: payload.action === 'hide_post' ? posts_status.hidden : posts_status.removed,
          ...(payload.action === 'remove_post' ? { removed_reason: reason } : {}),
        },
      })
    } else if (payload.action === 'ban_user') {
      if (!report.reported_user_id) throw new ReportInputError('Báo cáo này không thuộc về người dùng.')
      await transaction.users.update({
        where: { id: report.reported_user_id },
        data: { status: users_status.banned, ban_reason: reason, banned_until: null },
      })
      await transaction.user_bans.create({
        data: { user_id: report.reported_user_id, banned_by: adminId, reason: reason! },
      })
    }

    await transaction.reports.update({
      where: { id },
      data: { status: payload.action === 'dismiss' ? reports_status.dismissed : reports_status.reviewed },
    })
  })

  return getAdminReportDetail(id)
}