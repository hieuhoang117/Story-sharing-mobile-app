import type { ReactNode } from 'react'
import {
  Card,
  Col,
  Empty,
  Row,
  Statistic,
  Table,
  Tabs,
  Typography,
} from 'antd'
import type { TableColumnsType, TabsProps } from 'antd'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  AnalyticsDistributionRecord,
  AnalyticsPeakHourRecord,
  AnalyticsPostRecord,
  AnalyticsReportReasonRecord,
  AnalyticsReportedUserRecord,
  AnalyticsResponse,
  AnalyticsUserRecord,
  EngagementTrendRecord,
  GrowthRecord,
  ReportRecord,
} from './analyticsTypes'

const { Text } = Typography
const chartColors = ['#167d70', '#7c91df', '#e4a345', '#d66b6b', '#8b70bb']
const formatNumber = (value: number) => value.toLocaleString('vi-VN')
const tooltipNumber = (value: unknown) => formatNumber(Number(value))
const reportStatusNames: Record<string, string> = {
  pending: 'Đang chờ',
  reviewed: 'Đã xem xét',
  dismissed: 'Đã bỏ qua',
}
const postStatusNames: Record<string, string> = {
  active: 'Đang hoạt động',
  hidden: 'Đã ẩn',
  removed: 'Đã gỡ',
}
const visibilityNames: Record<string, string> = {
  public: 'Công khai',
  followers: 'Người theo dõi',
  private: 'Riêng tư',
}

interface AnalyticsFeatureTabsProps {
  analytics: AnalyticsResponse
  reportColumns: TableColumnsType<ReportRecord>
  reportsLoading: boolean
}

function ChartFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="analytics-feature-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

function SliceChart({ data, label }: { data: AnalyticsDistributionRecord[]; label: string }) {
  if (!data.some((item) => item.value > 0)) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />
  }

  return (
    <ChartFrame label={label}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius={86} label>
          {data.map((item, index) => (
            <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipNumber} />
        <Legend />
      </PieChart>
    </ChartFrame>
  )
}

function GrowthChart({ data }: { data: GrowthRecord[] }) {
  return (
    <Card
      title="Tăng trưởng nền tảng"
      extra={<Text type="secondary">Người dùng và bài viết mới · 6 tháng</Text>}
      className="analytics-panel-card"
    >
      <ChartFrame label="Biểu đồ đường số người dùng và bài viết mới trong sáu tháng">
        <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="#e8eeeb" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => `${value / 1000}k`}
          />
          <Tooltip formatter={tooltipNumber} />
          <Legend />
          <Line type="monotone" dataKey="users" name="Người dùng mới" stroke="#167d70" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="posts" name="Bài viết mới" stroke="#7c91df" strokeWidth={3} dot={false} />
        </LineChart>
      </ChartFrame>
    </Card>
  )
}

function EngagementChart({ data }: { data: EngagementTrendRecord[] }) {
  return (
    <Card title="Tương tác theo thời gian" className="analytics-panel-card">
      <ChartFrame label="Biểu đồ tương tác gồm lượt thích, bình luận và chia sẻ lại trong bảy ngày">
        <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="#e8eeeb" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <Tooltip formatter={tooltipNumber} />
          <Legend />
          <Line type="monotone" dataKey="likes" name="Lượt thích" stroke="#167d70" strokeWidth={2.5} />
          <Line type="monotone" dataKey="comments" name="Bình luận" stroke="#7c91df" strokeWidth={2.5} />
          <Line type="monotone" dataKey="reposts" name="Chia sẻ lại" stroke="#e4a345" strokeWidth={2.5} />
        </LineChart>
      </ChartFrame>
    </Card>
  )
}

function OverviewTab({ analytics }: { analytics: AnalyticsResponse }) {
  const postColumns: TableColumnsType<AnalyticsPostRecord> = [
    { title: 'Bài viết', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: 'Tác giả', dataIndex: 'author', key: 'author' },
    { title: 'Lượt thích', dataIndex: 'likes', key: 'likes', render: formatNumber },
    { title: 'Bình luận', dataIndex: 'comments', key: 'comments', render: formatNumber },
    { title: 'Chia sẻ', dataIndex: 'reposts', key: 'reposts', render: formatNumber },
  ]
  const userColumns: TableColumnsType<AnalyticsUserRecord> = [
    { title: 'Tài khoản', dataIndex: 'username', key: 'username' },
    { title: 'Bài viết', dataIndex: 'postCount', key: 'postCount', render: formatNumber },
    { title: 'Người theo dõi', dataIndex: 'followerCount', key: 'followerCount', render: formatNumber },
  ]

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-stat-card analytics-stat-card--primary">
            <Statistic title="Tổng người dùng" value={analytics.metrics.totalUsers} groupSeparator="." />
            <Text type={analytics.metrics.userGrowthPercentage >= 0 ? 'success' : 'danger'}>
              {Math.abs(analytics.metrics.userGrowthPercentage)}% so với tháng trước
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-stat-card">
            <Statistic title="Tổng bài viết" value={analytics.metrics.totalPosts} groupSeparator="." />
            <Text type="secondary">Được đăng trên toàn nền tảng</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-stat-card analytics-stat-card--primary">
            <Statistic title="Tổng lượt thích" value={analytics.metrics.totalLikes} groupSeparator="." />
            <Text type="secondary">Mức độ tương tác của cộng đồng</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className={`analytics-stat-card${analytics.metrics.pendingReports > 0 ? ' analytics-stat-card--warning' : ''}`}>
            <Statistic title="Báo cáo đang chờ" value={analytics.metrics.pendingReports} />
            <Text type="secondary">Chờ người kiểm duyệt xử lý</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-stat-card">
            <Statistic title="Người dùng mới hôm nay" value={analytics.metrics.newUsersToday} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-stat-card">
            <Statistic title="Bài viết mới hôm nay" value={analytics.metrics.newPostsToday} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-stat-card">
            <Statistic title="Người dùng mới tuần này" value={analytics.metrics.newUsersThisWeek} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="analytics-stat-card">
            <Statistic title="Bài viết mới tuần này" value={analytics.metrics.newPostsThisWeek} />
          </Card>
        </Col>
      </Row>

      <GrowthChart data={analytics.growthData} />
      <EngagementChart data={analytics.engagementTrend} />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Top bài viết nổi bật" className="analytics-reports-card">
            <Table<AnalyticsPostRecord>
              rowKey="id"
              columns={postColumns}
              dataSource={analytics.topPosts}
              pagination={false}
              scroll={{ x: 650 }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="Top người dùng theo số bài viết" className="analytics-reports-card">
            <Table<AnalyticsUserRecord>
              rowKey="id"
              columns={userColumns}
              dataSource={analytics.topUsersByPosts}
              pagination={false}
              scroll={{ x: 420 }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Top người dùng theo người theo dõi" className="analytics-reports-card">
            <Table<AnalyticsUserRecord>
              rowKey="id"
              columns={userColumns}
              dataSource={analytics.topUsersByFollowers}
              pagination={false}
              scroll={{ x: 420 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

function ModerationTab({ analytics, reportColumns, reportsLoading }: {
  analytics: AnalyticsResponse
  reportColumns: TableColumnsType<ReportRecord>
  reportsLoading: boolean
}) {
  const reasonColumns: TableColumnsType<AnalyticsReportReasonRecord> = [
    { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
    { title: 'Số báo cáo', dataIndex: 'reports', key: 'reports', render: formatNumber },
  ]
  const userColumns: TableColumnsType<AnalyticsReportedUserRecord> = [
    { title: 'Tài khoản', dataIndex: 'username', key: 'username' },
    { title: 'Số lần bị báo cáo', dataIndex: 'reportCount', key: 'reportCount', render: formatNumber },
  ]
  const statuses = analytics.reportStats.byStatus.map((item) => ({
    ...item,
    name: reportStatusNames[item.name] ?? item.name,
  }))
  const postStatuses = analytics.postStats.byStatus.map((item) => ({
    ...item,
    name: postStatusNames[item.name] ?? item.name,
  }))

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title="Báo cáo theo trạng thái">
            <SliceChart data={statuses} label="Biểu đồ tròn báo cáo theo trạng thái" />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Bài viết theo trạng thái">
            <SliceChart data={postStatuses} label="Biểu đồ tròn bài viết theo trạng thái" />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Báo cáo theo lý do">
            <Table<AnalyticsReportReasonRecord>
              rowKey="reason"
              columns={reasonColumns}
              dataSource={analytics.reportStats.byReason}
              pagination={{ pageSize: 5, showSizeChanger: false }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Người dùng bị báo cáo nhiều nhất">
            <Table<AnalyticsReportedUserRecord>
              rowKey="id"
              columns={userColumns}
              dataSource={analytics.reportStats.repeatReportedUsers}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
      <Card
        title="Báo cáo kiểm duyệt gần đây"
        extra={<Text type="secondary">{analytics.reports.length} báo cáo gần đây</Text>}
        className="analytics-reports-card"
      >
        <Table
          rowKey="id"
          columns={reportColumns}
          dataSource={analytics.reports}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          loading={reportsLoading}
          scroll={{ x: 995 }}
          size="middle"
        />
      </Card>
    </>
  )
}

function ContentBehaviorTab({ analytics }: { analytics: AnalyticsResponse }) {
  const hourColumns: TableColumnsType<AnalyticsPeakHourRecord> = [
    { title: 'Khung giờ', dataIndex: 'hour', key: 'hour' },
    { title: 'Bài viết', dataIndex: 'posts', key: 'posts', render: formatNumber },
  ]
  const visibility = analytics.postStats.byVisibility.map((item) => ({
    ...item,
    name: visibilityNames[item.name] ?? item.name,
  }))
  const peakHour = [...analytics.postStats.peakHours].sort((a, b) => b.posts - a.posts)[0]

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card title="Phân bố quyền xem bài viết">
          <SliceChart data={visibility} label="Biểu đồ tròn phân bố quyền xem bài viết" />
        </Card>
      </Col>
      <Col xs={24} xl={12}>
        <Card className="analytics-stat-card analytics-stat-card--primary">
          <Statistic
            title="Tương tác trung bình mỗi bài viết"
            value={analytics.metrics.averageInteractionsPerPost}
            precision={1}
          />
          <Text type="secondary">(Lượt thích + bình luận + chia sẻ lại) / tổng số bài viết</Text>
        </Card>
      </Col>
      <Col xs={24}>
        <Card title="Giờ đăng bài cao điểm">
          <ChartFrame label="Biểu đồ số bài viết theo từng giờ trong ngày">
            <BarChart data={analytics.postStats.peakHours} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#e8eeeb" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={2} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={tooltipNumber} />
              <Bar dataKey="posts" name="Bài viết" fill="#167d70" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartFrame>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Khung giờ đăng nhiều nhất">
          {peakHour && peakHour.posts > 0 ? (
            <>
              <Text strong>{peakHour.hour}</Text>
              <br />
              <Text type="secondary">{formatNumber(peakHour.posts)} bài được đăng.</Text>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu bài viết" />
          )}
        </Card>
      </Col>
      <Col xs={24}>
        <Card title="Số bài viết theo từng giờ" className="analytics-reports-card">
          <Table<AnalyticsPeakHourRecord>
            rowKey="hour"
            columns={hourColumns}
            dataSource={analytics.postStats.peakHours}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  )
}

export default function AnalyticsFeatureTabs({
  analytics,
  reportColumns,
  reportsLoading,
}: AnalyticsFeatureTabsProps) {
  const items: TabsProps['items'] = [
    {
      key: 'growth',
      label: 'Tăng trưởng & tương tác',
      children: <OverviewTab analytics={analytics} />,
    },
    {
      key: 'moderation',
      label: 'Kiểm duyệt',
      children: (
        <ModerationTab
          analytics={analytics}
          reportColumns={reportColumns}
          reportsLoading={reportsLoading}
        />
      ),
    },
    {
      key: 'content',
      label: 'Nội dung & hành vi',
      children: <ContentBehaviorTab analytics={analytics} />,
    },
  ]

  return <Tabs items={items} className="analytics-feature-tabs" />
}
