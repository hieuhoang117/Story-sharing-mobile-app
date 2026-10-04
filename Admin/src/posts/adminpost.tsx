import type { TableProps } from 'antd'
import { Alert, Button, message, Modal, Table } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contextAdmin/AuthContext'
import DetailPost, { type AdminPostDetailData } from './detailpost'
import SearchAdminPost, { type FindPostParams } from './searchadminpost'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

type AdminPostRow = AdminPostDetailData

type AdminPostsResponse = {
  data?: AdminPostRow[]
  message?: string
}

type UpdatePostStatusResponse = {
  data?: { status: AdminPostRow['status'] }
  message?: string
}

const requestAdminPosts = (token: string, params: FindPostParams = {}) =>
  axios.get<AdminPostsResponse>(`${API_BASE_URL}/admin/posts/findpost`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })

export default function AdminPost() {
  const { token } = useAuth()
  const [posts, setPosts] = useState<AdminPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedPost, setSelectedPost] = useState<AdminPostRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleSearch = async (params: FindPostParams) => {
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập lại để xem bài viết.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
      const response = await requestAdminPosts(token, params)
      setPosts(response.data.data ?? [])
    } catch (error) {
      setErrorMessage(
        axios.isAxiosError<AdminPostsResponse>(error)
          ? error.response?.data?.message ?? 'Không thể tìm bài viết.'
          : 'Không thể tìm bài viết.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (post: AdminPostRow) => {
    if (!token) return

    try {
      const response = await axios.patch<UpdatePostStatusResponse>(
        `${API_BASE_URL}/admin/posts/${post.id}/status`,
        { status: post.status },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const updatedStatus = response.data.data?.status ?? post.status
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, status: updatedStatus } : item))
      setSelectedPost((current) => current?.id === post.id ? { ...current, status: updatedStatus } : current)
      setDetailOpen(false)
      message.success('Đã cập nhật trạng thái bài viết.')
    } catch (error) {
      const errorText = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? 'Không thể cập nhật trạng thái bài viết.'
        : 'Không thể cập nhật trạng thái bài viết.'
      message.error(errorText)
    }
  }

  const handleDelete = (post: AdminPostRow) => {
    if (!token) return

    Modal.confirm({
      title: 'Xóa bài viết này?',
      content: 'Thao tác này không thể hoàn tác.',
      okText: 'Xóa bài viết',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/admin/posts/${post.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setPosts((current) => current.filter((item) => item.id !== post.id))
          setSelectedPost(null)
          setDetailOpen(false)
          message.success('Đã xóa bài viết.')
        } catch (error) {
          const errorText = axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message ?? 'Không thể xóa bài viết.'
            : 'Không thể xóa bài viết.'
          message.error(errorText)
        }
      },
    })
  }

  const columns: TableProps<AdminPostRow>['columns'] = [
    {
      title: 'Username',
      dataIndex: ['users', 'username'],
      key: 'username',
      render: (_: unknown, post) => post.users?.username ?? '—',
    },
    {
      title: 'Email',
      dataIndex: ['users', 'email'],
      key: 'email',
      render: (_: unknown, post) => post.users?.email ?? '—',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content) => content || '—',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (value) => new Date(value).toLocaleString('vi-VN'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, post) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedPost(post)
            setDetailOpen(true)
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  useEffect(() => {
    let isMounted = true

    const fetchPosts = async () => {
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập lại để xem bài viết.')
        setLoading(false)
        return
      }

      try {
        const response = await requestAdminPosts(token)
        if (isMounted) setPosts(response.data.data ?? [])
      } catch (error) {
        if (!isMounted) return
        setErrorMessage(
          axios.isAxiosError<AdminPostsResponse>(error)
            ? error.response?.data?.message ?? 'Không thể tải danh sách bài viết.'
            : 'Không thể tải danh sách bài viết.',
        )
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void fetchPosts()
    return () => {
      isMounted = false
    }
  }, [token])

  if (errorMessage) return <Alert type="error" showIcon message={errorMessage} />

  return (
    <>
      <SearchAdminPost onSearch={handleSearch} loading={loading} />
      <Table<AdminPostRow>
        rowKey="id"
        columns={columns}
        dataSource={posts}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 900 }}
      />
      <DetailPost
        open={detailOpen}
        post={selectedPost}
        onSave={handleSave}
        onCancel={() => setDetailOpen(false)}
        onDelete={handleDelete}
      />
    </>
  )
}