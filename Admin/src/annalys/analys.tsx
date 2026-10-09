import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Alert, Button, message, Space, Spin, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contextAdmin/AuthContext'
import AnalyticsFeatureTabs from './AnalyticsFeatureTabs'
import type {
  AnalyticsApiResponse,
  ApiErrorResponse,
  ReportApiResponse,
  ReportRecord,
  ReportStatus,
} from './analyticsTypes'
import './analys.css'

const { Text, Title } = Typography

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data.message) {
    return error.response.data.message
  }
  return fallback
}

const statusColor: Record<ReportStatus, string> = {
  pending: 'gold',
  reviewed: 'blue',
  dismissed: 'default',
}

const statusLabel: Record<ReportStatus, string> = {
  pending: 'Đang chờ',
  reviewed: 'Đã xem xét',
  dismissed: 'Đã bỏ qua',
}

export default function AdminAnalysis() {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsApiResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null)
  const [refreshVersion, setRefreshVersion] = useState(0)

  useEffect(() => {
    if (!token) return

    const controller = new AbortController()
    axios.get<AnalyticsApiResponse>(`${API_BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(({ data }) => {
        setAnalytics(data.data)
        setErrorMessage('')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setErrorMessage(getErrorMessage(error, 'Không thể tải dữ liệu thống kê.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [token, refreshVersion])

  const updateReportStatus = async (reportId: string, status: ReportStatus) => {
    if (!token) return
    setUpdatingReportId(reportId)
    try {
      const { data } = await axios.patch<ReportApiResponse>(
        `${API_BASE_URL}/admin/analytics/reports/${reportId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setAnalytics((current) => {
        if (!current) return current
        const previousStatus = current.reports.find((report) => report.id === reportId)?.status
        const pendingDelta = previousStatus === 'pending' && data.data.status !== 'pending' ? -1 : 0
        return {
          ...current,
          reports: current.reports.map((report) => report.id === reportId ? data.data : report),
          metrics: {
            ...current.metrics,
            pendingReports: Math.max(0, current.metrics.pendingReports + pendingDelta),
          },
        }
      })
      message.success('Đã cập nhật trạng thái báo cáo.')
    } catch (error) {
      message.error(getErrorMessage(error, 'Không thể cập nhật trạng thái báo cáo.'))
    } finally {
      setUpdatingReportId(null)
    }
  }

  const reportColumns: TableColumnsType<ReportRecord> = [
    {
      title: 'ID người báo cáo',
      dataIndex: 'reporter_id',
      key: 'reporter_id',
      width: 130,
      render: (reporterId: string) => <Text code>{reporterId}</Text>,
    },
    {
      title: 'Đối tượng bị báo cáo',
      key: 'target',
      width: 160,
      render: (_, report) => {
        if (report.post_id) return <Text code>Bài viết · {report.post_id}</Text>
        if (report.reported_user_id) return <Text code>Người dùng · {report.reported_user_id}</Text>
        return <Text type="secondary">—</Text>
      },
    },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason', width: 220 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: ReportStatus) => <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>,
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 190,
      render: formatDate,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 185,
      render: (_, report) => (
        <Space size="small">
          {report.status === 'pending' ? (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => updateReportStatus(report.id, 'reviewed')}
                loading={updatingReportId === report.id}
                aria-label={`Xem xét báo cáo ${report.id}`}
              >
                Xem xét
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => updateReportStatus(report.id, 'dismissed')}
                loading={updatingReportId === report.id}
                aria-label={`Bỏ qua báo cáo ${report.id}`}
              >
                Bỏ qua
              </Button>
            </>
          ) : (
            <Text type="secondary">Không có thao tác</Text>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" className="analytics-dashboard">
      <div>
        <Text type="secondary">TỔNG QUAN NỀN TẢNG</Text>
        <Title level={3} className="analytics-dashboard__title">Bảng điều khiển phân tích</Title>
        <Text type="secondary">
          Chọn một nhóm chức năng để theo dõi tăng trưởng, kiểm duyệt và hành vi nội dung.
        </Text>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải dữ liệu tổng quan"
          description={errorMessage}
          action={
            <Button
              size="small"
              onClick={() => {
                setLoading(true)
                setRefreshVersion((version) => version + 1)
              }}
            >
              Thử lại
            </Button>
          }
        />
      )}

      {loading && <Spin tip="Đang tải dữ liệu thống kê..." />}

      {analytics && (
        <AnalyticsFeatureTabs
          analytics={analytics}
          reportColumns={reportColumns}
          reportsLoading={loading || updatingReportId !== null}
        />
      )}
    </Space>
  )
}
