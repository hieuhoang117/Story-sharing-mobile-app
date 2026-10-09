import {
    CheckCircleOutlined,
    EyeOutlined,
    StopOutlined,
    UserOutlined,
    WarningOutlined,
} from '@ant-design/icons'
import type { FormInstance, TableProps } from 'antd'
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Drawer,
    Empty,
    Form,
    Image,
    Input,
    List,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { forwardRef, useImperativeHandle } from 'react'
import type {
    ReportDetail,
    ReportItem,
    ReportStats,
    ReportStatus,
    ReportTargetType,
    ResolveAction,
} from './reportsTypes'

const { Text, Paragraph } = Typography
const { RangePicker } = DatePicker

export type ReportFilterFormValues = {
  status?: ReportStatus | 'all'
  targetType?: ReportTargetType | 'all'
  reason?: string
  dateRange?: [Dayjs | null, Dayjs | null] | null
  reporterKeyword?: string
}

const statusLabels: Record<ReportStatus, string> = {
  pending: 'Đang chờ',
  reviewed: 'Đã xem xét',
  dismissed: 'Đã bỏ qua',
}

const statusColors: Record<ReportStatus, string> = {
  pending: 'gold',
  reviewed: 'blue',
  dismissed: 'default',
}

function UserAvatar({ username, avatarUrl, size = 32 }: { username: string; avatarUrl: string | null; size?: number }) {
  return (
    <Avatar size={size} src={avatarUrl ?? undefined} icon={!avatarUrl ? <UserOutlined /> : undefined}>
      {!avatarUrl ? username.charAt(0).toLocaleUpperCase('vi-VN') : undefined}
    </Avatar>
  )
}

export function ReportStatsCards({
  stats,
  loading,
  onSelect,
}: {
  stats: ReportStats
  loading: boolean
  onSelect: (filter: ReportStatus | 'today') => void
}) {
  const cards: { key: ReportStatus | 'today'; title: string; value: number | string; icon: React.ReactNode; className?: string }[] = [
    { key: 'pending', title: 'Đang chờ', value: stats.pending, icon: <WarningOutlined />, className: stats.pending > 0 ? 'moderation-stat-warning' : '' },
    { key: 'reviewed', title: 'Đã xem xét', value: stats.reviewed, icon: <CheckCircleOutlined /> },
    { key: 'dismissed', title: 'Đã bỏ qua', value: stats.dismissed, icon: <StopOutlined /> },
    { key: 'today', title: 'Báo cáo hôm nay', value: stats.today ?? '—', icon: <EyeOutlined /> },
  ]

  return (
    <Row gutter={[14, 14]} className="moderation-stats">
      {cards.map((card) => (
        <Col xs={12} lg={6} key={card.key}>
          <Card
            className={`moderation-stat-card ${card.className ?? ''}`}
            loading={loading}
            hoverable
            role="button"
            tabIndex={0}
            onClick={() => onSelect(card.key)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(card.key)
              }
            }}
          >
            <Statistic title={card.title} value={card.value} prefix={card.icon} />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export function ReportFilters({
  form,
  onSearch,
  onReset,
}: {
  form: FormInstance<ReportFilterFormValues>
  onSearch: (values: ReportFilterFormValues) => void
  onReset: () => void
}) {
  return (
    <Card className="moderation-filter-card">
      <Form form={form} layout="vertical" onFinish={onSearch} initialValues={{ status: 'pending', targetType: 'all' }}>
        <Row gutter={[14, 0]} align="bottom">
          <Col xs={24} sm={12} lg={4}>
            <Form.Item label="Trạng thái" name="status">
              <Select options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'pending', label: 'Đang chờ' },
                { value: 'reviewed', label: 'Đã xem xét' },
                { value: 'dismissed', label: 'Đã bỏ qua' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Form.Item label="Loại đối tượng" name="targetType">
              <Select options={[
                { value: 'all', label: 'Tất cả đối tượng' },
                { value: 'post', label: 'Bài viết' },
                { value: 'user', label: 'Người dùng' },
              ]} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Form.Item label="Lý do" name="reason">
              <Select allowClear placeholder="Tất cả lý do" options={[
                'Spam', 'Quấy rối', 'Nội dung không phù hợp', 'Thông tin sai lệch', 'Mạo danh', 'Lừa đảo',
              ].map((reason) => ({ value: reason, label: reason }))} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Form.Item label="Khoảng thời gian" name="dateRange">
              <RangePicker className="moderation-range-picker" format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={16} lg={4}>
            <Form.Item label="Người báo cáo" name="reporterKeyword">
              <Input allowClear placeholder="Nhập tên tài khoản" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} lg={3}>
            <Form.Item>
              <Space className="moderation-filter-actions">
                <Button type="primary" htmlType="submit">Tìm kiếm</Button>
                <Button onClick={onReset}>Đặt lại</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export function ReportTable({
  items,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onOpenDetail,
}: {
  items: ReportItem[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  onPageChange: (page: number, pageSize: number) => void
  onOpenDetail: (report: ReportItem) => void
}) {
  const columns: TableProps<ReportItem>['columns'] = [
    {
      title: 'Người báo cáo',
      key: 'reporter',
      width: 175,
      render: (_value: unknown, report) => (
        <Space size={9}>
          <UserAvatar username={report.reporter.username} avatarUrl={report.reporter.avatar_url} size={30} />
          <Text strong>@{report.reporter.username}</Text>
        </Space>
      ),
    },
    {
      title: 'Đối tượng bị báo cáo',
      key: 'target',
      width: 300,
      render: (_value: unknown, report) => report.targetType === 'post' ? (
        <div className="moderation-target-cell">
          <Tooltip title={report.targetPost?.content ?? 'Không có nội dung bài viết'}>
            <Text className="moderation-post-excerpt">
              {(report.targetPost?.content || 'Bài viết không có nội dung').slice(0, 60)}
              {(report.targetPost?.content.length ?? 0) > 60 ? '…' : ''}
            </Text>
          </Tooltip>
          <Text type="secondary">Tác giả: @{report.targetUser.username}</Text>
        </div>
      ) : (
        <Space size={9}>
          <UserAvatar username={report.targetUser.username} avatarUrl={report.targetUser.avatar_url} size={30} />
          <div className="moderation-target-cell">
            <Text strong>{report.targetUser.display_name || report.targetUser.username}</Text>
            <Text type="secondary">@{report.targetUser.username}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 170,
      render: (reason: string) => <Tag color="volcano">{reason}</Tag>,
    },
    {
      title: 'Báo cáo cùng đối tượng',
      dataIndex: 'sameTargetReportCount',
      key: 'sameTargetReportCount',
      width: 155,
      align: 'center',
      render: (count: number) => <Badge count={count} showZero color={count >= 3 ? '#c43d3d' : '#73847e'} />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: ReportStatus) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 105,
      fixed: 'right',
      render: (_value: unknown, report) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => onOpenDetail(report)}>Chi tiết</Button>
      ),
    },
  ]

  return (
    <Card className="moderation-table-card" bodyStyle={{ padding: 0 }}>
      <Table<ReportItem>
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        scroll={{ x: 1120 }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có báo cáo phù hợp" /> }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (count, range) => `Hiển thị ${range[0]}–${range[1]} trong ${count} báo cáo`,
          onChange: onPageChange,
        }}
      />
    </Card>
  )
}

export function ReportDetailDrawer({
  open,
  loading,
  report,
  resolving,
  onClose,
  onResolve,
}: {
  open: boolean
  loading: boolean
  report: ReportDetail | null
  resolving: boolean
  onClose: () => void
  onResolve: (action: ResolveAction) => void
}) {
  return (
    <Drawer
      title="Chi tiết báo cáo"
      open={open}
      onClose={onClose}
      width={600}
      destroyOnHidden
      className="moderation-detail-drawer"
    >
      {loading || !report ? <div className="moderation-detail-loading"><Spin tip="Đang tải chi tiết..." /></div> : (
        <Space direction="vertical" size={20} className="moderation-detail-content">
          <Descriptions title="Thông tin báo cáo" column={1} size="small" bordered>
            <Descriptions.Item label="Người báo cáo">
              <Space><UserAvatar username={report.reporter.username} avatarUrl={report.reporter.avatar_url} />@{report.reporter.username}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do"><Tag color="volcano">{report.reason}</Tag></Descriptions.Item>
            <Descriptions.Item label="Thời gian gửi">{dayjs(report.created_at).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
          </Descriptions>

          {report.targetType === 'post' && report.targetPost && (
            <section className="moderation-detail-section">
              <Text strong>Nội dung bài viết</Text>
              <Paragraph className="moderation-post-content">{report.targetPost.content || 'Bài viết không có nội dung.'}</Paragraph>
              {report.targetPost.media.length > 0 && (
                <Image.PreviewGroup>
                  <Space wrap>
                    {report.targetPost.media.map((media, index) => (
                      <Image key={`${media.url}-${index}`} src={media.url} alt={`Ảnh ${index + 1} trong bài viết`} width={112} height={96} className="moderation-post-image" />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              )}
            </section>
          )}

          <section className="moderation-detail-section">
            <Text strong>{report.targetType === 'post' ? 'Tác giả bài viết' : 'Người dùng bị báo cáo'}</Text>
            <Space className="moderation-author" size={10}>
              <UserAvatar username={report.targetUser.username} avatarUrl={report.targetUser.avatar_url} size={38} />
              <div className="moderation-target-cell">
                <Text strong>{report.targetUser.display_name || report.targetUser.username}</Text>
                <Text type="secondary">@{report.targetUser.username}</Text>
              </div>
            </Space>
          </section>

          <section className="moderation-detail-section">
            <Text strong>Báo cáo khác cùng đối tượng ({report.sameTargetReportCount})</Text>
            <List
              className="moderation-related-list"
              size="small"
              dataSource={report.relatedReports}
              locale={{ emptyText: 'Chưa có báo cáo liên quan khác' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<UserAvatar username={item.reporter.username} avatarUrl={item.reporter.avatar_url} size={28} />}
                    title={<span>@{item.reporter.username} · {item.reason}</span>}
                    description={dayjs(item.created_at).format('DD/MM/YYYY HH:mm')}
                  />
                  <Tag color={statusColors[item.status]}>{statusLabels[item.status]}</Tag>
                </List.Item>
              )}
            />
          </section>

          {report.status === 'pending' && (
            <div className="moderation-resolve-actions">
              {report.targetType === 'post' ? (
                <>
                  <Button danger loading={resolving} onClick={() => onResolve('remove_post')}>Gỡ bài viết</Button>
                  <Button loading={resolving} onClick={() => onResolve('hide_post')}>Ẩn bài viết</Button>
                </>
              ) : (
                <Button danger loading={resolving} onClick={() => onResolve('ban_user')}>Khóa người dùng</Button>
              )}
              <Button loading={resolving} onClick={() => onResolve('dismiss')}>Bỏ qua báo cáo</Button>
            </div>
          )}
        </Space>
      )}
    </Drawer>
  )
}

export interface ResolveActionModalHandle {
  confirm: (action: ResolveAction) => void
}

type ResolveActionModalProps = {
  onConfirm: (action: ResolveAction, reason?: string) => Promise<void>
}

type ResolveReasonForm = { reason: string }

const actionLabels: Record<ResolveAction, string> = {
  remove_post: 'Gỡ bài viết',
  hide_post: 'Ẩn bài viết',
  ban_user: 'Khóa người dùng',
  dismiss: 'Bỏ qua báo cáo',
}

export const ResolveActionModal = forwardRef<ResolveActionModalHandle, ResolveActionModalProps>(function ResolveActionModal(
  { onConfirm },
  ref,
) {
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<ResolveReasonForm>()

  useImperativeHandle(ref, () => ({
    confirm(action) {
      const requiresReason = action === 'remove_post' || action === 'ban_user'
      form.resetFields()
      modal.confirm({
        title: `Xác nhận ${actionLabels[action].toLocaleLowerCase('vi-VN')}?`,
        content: (
          <div>
            <Paragraph>Bạn có chắc chắn muốn thực hiện thao tác này?</Paragraph>
            {requiresReason && (
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Lý do xử lý"
                  name="reason"
                  rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập lý do xử lý.' }]}
                >
                  <Input.TextArea rows={3} maxLength={300} showCount placeholder="Nhập lý do" />
                </Form.Item>
              </Form>
            )}
          </div>
        ),
        okText: actionLabels[action],
        cancelText: 'Hủy',
        okButtonProps: { danger: action === 'remove_post' || action === 'ban_user' },
        onOk: async () => {
          let reason: string | undefined
          if (requiresReason) {
            const values = await form.validateFields()
            reason = values.reason.trim()
            if (!reason) throw new Error('Vui lòng nhập lý do xử lý.')
          }
          await onConfirm(action, reason)
        },
      })
    },
  }), [form, modal, onConfirm])

  return contextHolder
})