import type { TableProps } from 'antd'
import { Avatar, Button, Descriptions, Form, message, Modal, Select, Table, Tag, Typography } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contextAdmin/AuthContext'
import './adminuser.css'
import SearchAdminUser, { type FindUserParams } from './searchadminuser'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

type AdminUserRow = {
  id: string
  username: string
  display_name: string | null
  email: string
  role: 'user' | 'moderator' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  avatar_url: string | null
  bio: string | null
  is_private: 0 | 1
  is_verified: 0 | 1
  created_at: string
  updated_at: string
}

type AdminUsersResponse = {
  data?: AdminUserRow[]
  message?: string
}

type UserDetailResponse = {
  data?: AdminUserRow
  message?: string
}

const getUserStatusTag = (status: AdminUserRow['status']) => {
  const map = {
    active: { color: 'success', text: 'Hoạt động' },
    suspended: { color: 'warning', text: 'Tạm ngưng' },
    banned: { color: 'error', text: 'Đã cấm' },
  }

  return <Tag color={map[status].color}>{map[status].text}</Tag>
}

const getUserRoleTag = (role: AdminUserRow['role']) => {
  const map = {
    user: { color: 'blue', text: 'Người dùng' },
    moderator: { color: 'purple', text: 'Điều hành viên' },
    admin: { color: 'red', text: 'Quản trị viên' },
  }

  return <Tag color={map[role].color}>{map[role].text}</Tag>
}

const requestAdminUsers = (token: string, params: FindUserParams = {}) =>
  axios.get<AdminUsersResponse>(`${API_BASE_URL}/admin/users/find`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })

const updateUserStatus = (token: string, id: string, status: AdminUserRow['status']) =>
  axios.patch<{ data?: AdminUserRow; message?: string }>(
    `${API_BASE_URL}/admin/users/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } },
  )

const updateUserRole = (token: string, id: string, role: AdminUserRow['role']) =>
  axios.patch<{ data?: AdminUserRow; message?: string }>(
    `${API_BASE_URL}/admin/users/${id}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } },
  )

const deleteUser = (token: string, id: string) =>
  axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

export default function AdminUser() {
  const { token } = useAuth()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusForm] = Form.useForm<{ status: AdminUserRow['status'] }>()
  const [roleForm] = Form.useForm<{ role: AdminUserRow['role'] }>()

  const fetchUsers = async (params: FindUserParams = {}) => {
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập lại để xem người dùng.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
      const response = await requestAdminUsers(token, params)
      setUsers(response.data.data ?? [])
    } catch (error) {
      setErrorMessage(
        axios.isAxiosError<AdminUsersResponse>(error)
          ? error.response?.data?.message ?? 'Không thể tìm người dùng.'
          : 'Không thể tìm người dùng.',
      )
    } finally {
      setLoading(false)
    }
  }

  const openUserDetail = async (user: AdminUserRow) => {
    if (!token) return

    try {
      const response = await axios.get<UserDetailResponse>(`${API_BASE_URL}/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const detail = response.data.data ?? user
      setSelectedUser(detail)
      statusForm.setFieldsValue({ status: detail.status })
      roleForm.setFieldsValue({ role: detail.role })
      setDetailOpen(true)
    } catch (error) {
      const errorText = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? 'Không thể tải thông tin người dùng.'
        : 'Không thể tải thông tin người dùng.'
      message.error(errorText)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedUser || !token) return

    const status = statusForm.getFieldValue('status') as AdminUserRow['status']
    try {
      await updateUserStatus(token, selectedUser.id, status)
      setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, status } : user))
      setSelectedUser((current) => (current ? { ...current, status } : current))
      message.success('Đã cập nhật trạng thái người dùng.')
    } catch (error) {
      const errorText = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? 'Không thể cập nhật trạng thái người dùng.'
        : 'Không thể cập nhật trạng thái người dùng.'
      message.error(errorText)
    }
  }

  const handleRoleChange = async () => {
    if (!selectedUser || !token) return

    const role = roleForm.getFieldValue('role') as AdminUserRow['role']
    try {
      await updateUserRole(token, selectedUser.id, role)
      setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, role } : user))
      setSelectedUser((current) => (current ? { ...current, role } : current))
      message.success('Đã cập nhật vai trò người dùng.')
    } catch (error) {
      const errorText = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? 'Không thể cập nhật vai trò người dùng.'
        : 'Không thể cập nhật vai trò người dùng.'
      message.error(errorText)
    }
  }

  const handleDelete = () => {
    if (!selectedUser || !token) return

    Modal.confirm({
      title: 'Xóa tài khoản người dùng này?',
      content: 'Hành động này sẽ xóa tài khoản khỏi hệ thống.',
      okText: 'Xóa tài khoản',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUser(token, selectedUser.id)
          setUsers((current) => current.filter((user) => user.id !== selectedUser.id))
          setSelectedUser(null)
          setDetailOpen(false)
          message.success('Đã xóa tài khoản người dùng.')
        } catch (error) {
          const errorText = axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message ?? 'Không thể xóa tài khoản người dùng.'
            : 'Không thể xóa tài khoản người dùng.'
          message.error(errorText)
        }
      },
    })
  }

  const columns: TableProps<AdminUserRow>['columns'] = [
    {
      title: 'Avatar',
      dataIndex: 'avatar_url',
      key: 'avatar',
      width: 80,
      render: (avatarUrl: string | null) => (
        <Avatar src={avatarUrl || undefined} size={38}>
          {avatarUrl ? null : 'U'}
        </Avatar>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tên hiển thị',
      dataIndex: 'display_name',
      key: 'display_name',
      render: (value) => value || '—',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getUserRoleTag(role),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getUserStatusTag(status),
    },
    {
      title: 'Xác minh',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (isVerified) => (isVerified === 1 ? 'Đã xác minh' : 'Chưa xác minh'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, user) => (
        <Button size="small" onClick={() => openUserDetail(user)}>
          Chi tiết
        </Button>
      ),
    },
  ]

  useEffect(() => {
    void fetchUsers()
  }, [token])

  if (errorMessage) return <div className="admin-user-error"><strong>Lỗi:</strong> {errorMessage}</div>

  return (
    <>
      <SearchAdminUser onSearch={fetchUsers} loading={loading} />
      <Table<AdminUserRow>
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Chi tiết người dùng"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        width={760}
        footer={[
          <Button key="delete" danger onClick={handleDelete}>Xóa tài khoản</Button>,
          <Button key="close" onClick={() => setDetailOpen(false)}>Đóng</Button>,
        ]}
      >
        {selectedUser && (
          <div className="admin-user-detail">
            <div className="admin-user-detail-header">
              <Avatar src={selectedUser.avatar_url || undefined} size={64}>
                {selectedUser.avatar_url ? null : selectedUser.username.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>{selectedUser.display_name || selectedUser.username}</Typography.Title>
                <Typography.Text type="secondary">@{selectedUser.username}</Typography.Text>
              </div>
            </div>

            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="ID người dùng">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">{getUserRoleTag(selectedUser.role)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getUserStatusTag(selectedUser.status)}</Descriptions.Item>
              <Descriptions.Item label="Kiểu tài khoản">{selectedUser.is_private === 1 ? 'Riêng tư' : 'Công khai'}</Descriptions.Item>
              <Descriptions.Item label="Xác minh">{selectedUser.is_verified === 1 ? 'Đã xác minh' : 'Chưa xác minh'}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{new Date(selectedUser.created_at).toLocaleString('vi-VN')}</Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">{new Date(selectedUser.updated_at).toLocaleString('vi-VN')}</Descriptions.Item>
              <Descriptions.Item label="Tiểu sử" span={2}>{selectedUser.bio || 'Không có tiểu sử'}</Descriptions.Item>
            </Descriptions>

            <div className="admin-user-action-panel">
              <Form form={statusForm} layout="inline">
                <Form.Item name="status" label="Trạng thái">
                  <Select options={[
                    { label: 'Hoạt động', value: 'active' },
                    { label: 'Tạm ngưng', value: 'suspended' },
                    { label: 'Đã cấm', value: 'banned' },
                  ]} />
                </Form.Item>
                <Button type="primary" onClick={handleStatusChange}>Cập nhật trạng thái</Button>
              </Form>

              <Form form={roleForm} layout="inline">
                <Form.Item name="role" label="Vai trò">
                  <Select options={[
                    { label: 'Người dùng', value: 'user' },
                    { label: 'Điều hành viên', value: 'moderator' },
                    { label: 'Quản trị viên', value: 'admin' },
                  ]} />
                </Form.Item>
                <Button type="primary" onClick={handleRoleChange}>Cập nhật vai trò</Button>
              </Form>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
