export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'

export interface ReportRecord {
  id: string
  reporter_id: string
  post_id: string | null
  reported_user_id: string | null
  reason: string
  status: ReportStatus
  created_at: string
}

export interface GrowthRecord {
  month: string
  users: number
  posts: number
}

export interface DashboardMetrics {
  totalUsers: number
  userGrowthPercentage: number
  totalPosts: number
  totalLikes: number
  pendingReports: number
  newUsersToday: number
  newPostsToday: number
  newUsersThisWeek: number
  newPostsThisWeek: number
  averageInteractionsPerPost: number
}

export interface EngagementTrendRecord {
  day: string
  likes: number
  comments: number
  reposts: number
}

export interface AnalyticsPostRecord {
  id: string
  content: string
  author: string
  likes: number
  comments: number
  reposts: number
}

export interface AnalyticsUserRecord {
  id: string
  username: string
  postCount: number
  followerCount: number
}

export interface AnalyticsDistributionRecord {
  name: string
  value: number
}

export interface AnalyticsReportReasonRecord {
  reason: string
  reports: number
}

export interface AnalyticsReportedUserRecord {
  id: string
  username: string
  reportCount: number
}

export interface AnalyticsPeakHourRecord {
  hour: string
  posts: number
}

export interface AnalyticsResponse {
  metrics: DashboardMetrics
  growthData: GrowthRecord[]
  engagementTrend: EngagementTrendRecord[]
  topPosts: AnalyticsPostRecord[]
  topUsersByPosts: AnalyticsUserRecord[]
  topUsersByFollowers: AnalyticsUserRecord[]
  reportStats: {
    byStatus: AnalyticsDistributionRecord[]
    byReason: AnalyticsReportReasonRecord[]
    repeatReportedUsers: AnalyticsReportedUserRecord[]
  }
  postStats: {
    byStatus: AnalyticsDistributionRecord[]
    byVisibility: AnalyticsDistributionRecord[]
    peakHours: AnalyticsPeakHourRecord[]
  }
  reports: ReportRecord[]
}

export interface AnalyticsApiResponse {
  data: AnalyticsResponse
}

export interface ReportApiResponse {
  data: ReportRecord
}

export interface ApiErrorResponse {
  message?: string
}
