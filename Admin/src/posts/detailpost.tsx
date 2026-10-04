import { Button, Descriptions, Image, Modal, Select, Space, Spin } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export type AdminPostDetailData = {
	id: string
	user_id: string
	content: string | null
	created_at: string | Date
	updated_at: string | Date
	status: 'active' | 'hidden' | 'removed'
	media?: { url: string }[]
	visibility?: string
	like_count?: number
	reply_count?: number
	repost_count?: number
	users?: {
		username?: string | null
		email?: string | null
	} | null
}

type DetailPostProps = {
	open: boolean
	post: AdminPostDetailData | null
	onSave: (post: AdminPostDetailData) => void
	onCancel: () => void
	onDelete: (post: AdminPostDetailData) => void
}

type PostImagesResponse = {
	data?: { url: string }[]
}

const statusOptions = [
	{ label: 'Hoạt động', value: 'active' },
	{ label: 'Ẩn', value: 'hidden' },
	{ label: 'Đã gỡ', value: 'removed' },
]

const formatDate = (value: string | Date) => new Date(value).toLocaleString('vi-VN')

export default function DetailPost({ open, post, onSave, onCancel, onDelete }: DetailPostProps) {
	const [content, setContent] = useState(post?.content ?? '')
	const [status, setStatus] = useState<AdminPostDetailData['status']>(post?.status ?? 'active')
	const [images, setImages] = useState(post?.media ?? [])
	const [imagesLoading, setImagesLoading] = useState(false)

	useEffect(() => {
		if (!post) return
		setContent(post.content ?? '')
		setStatus(post.status)
	}, [post, open])

	useEffect(() => {
		if (!open || !post) return

		let isMounted = true
		setImages(post.media ?? [])
		setImagesLoading(true)

		axios.get<PostImagesResponse>(`${API_BASE_URL}/posts/getpostpic/${post.id}`)
			.then((response) => {
				if (isMounted) setImages(response.data.data ?? [])
			})
			.catch(() => {
				if (isMounted) setImages(post.media ?? [])
			})
			.finally(() => {
				if (isMounted) setImagesLoading(false)
			})

		return () => {
			isMounted = false
		}
	}, [open, post])

	const handleSave = () => {
		if (!post) return
		onSave({ ...post, content, status })
	}

	return (
		<Modal
			title="Chi tiết bài viết"
			open={open}
			onCancel={onCancel}
			width={720}
			footer={
				<Space>
					<Button danger onClick={() => post && onDelete(post)} disabled={!post}>
						Xóa bài viết
					</Button>
					<Button onClick={onCancel}>Hủy</Button>
					<Button type="primary" onClick={handleSave} disabled={!post}>
						Lưu
					</Button>
				</Space>
			}
		>
			{post && (
				<>
					<Descriptions column={2} size="small" bordered>
						<Descriptions.Item label="ID bài viết">{post.id}</Descriptions.Item>
						<Descriptions.Item label="ID người đăng">{post.user_id}</Descriptions.Item>
						<Descriptions.Item label="Username">{post.users?.username || '—'}</Descriptions.Item>
						<Descriptions.Item label="Email">{post.users?.email || '—'}</Descriptions.Item>
						<Descriptions.Item label="Ngày tạo">{formatDate(post.created_at)}</Descriptions.Item>
						<Descriptions.Item label="Ngày cập nhật">{formatDate(post.updated_at)}</Descriptions.Item>
						{post.visibility && <Descriptions.Item label="Chế độ">{post.visibility}</Descriptions.Item>}
						{post.like_count !== undefined && <Descriptions.Item label="Likes">{post.like_count}</Descriptions.Item>}
						{post.reply_count !== undefined && <Descriptions.Item label="Replies">{post.reply_count}</Descriptions.Item>}
						{post.repost_count !== undefined && <Descriptions.Item label="Reposts">{post.repost_count}</Descriptions.Item>}
					</Descriptions>

					<div style={{ marginTop: 20 }}>
						<div style={{ marginBottom: 8 }}>Nội dung</div>
						<div style={{ whiteSpace: 'pre-wrap' }}>{content || '—'}</div>
					</div>

					<div style={{ marginTop: 20 }}>
						<div style={{ marginBottom: 8 }}>Ảnh bài viết</div>
						{imagesLoading ? <Spin size="small" /> : images.length ? (
							<Image.PreviewGroup>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
									{images.map((item, index) => (
										<Image
											key={`${item.url}-${index}`}
											src={item.url}
											alt={`Ảnh bài viết ${index + 1}`}
											width={120}
											height={120}
											style={{ objectFit: 'cover', borderRadius: 6 }}
										/>
									))}
								</div>
							</Image.PreviewGroup>
						) : (
							<div>Không có ảnh</div>
						)}
					</div>

					<div style={{ marginTop: 16 }}>
						<div style={{ marginBottom: 8 }}>Trạng thái</div>
						<Select
							value={status}
							options={statusOptions}
							onChange={setStatus}
							style={{ width: '100%' }}
						/>
					</div>
				</>
			)}
		</Modal>
	)
}
