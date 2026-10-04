import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd'
import type { Dayjs } from 'dayjs'

export type FindPostParams = {
	post_id?: string
	user_id?: string
	keyword?: string
	from?: string
	to?: string
	status?: 'active' | 'hidden' | 'removed'
	visibility?: 'public' | 'followers' | 'private'
	like_count_min?: number
	like_count_max?: number
	reply_count_min?: number
	reply_count_max?: number
	repost_count_min?: number
	repost_count_max?: number
}

type SearchPostFormValues = Omit<FindPostParams, 'from' | 'to'> & {
	date_range?: [Dayjs | null, Dayjs | null] | null
}

type SearchAdminPostProps = {
	onSearch: (params: FindPostParams) => void
	loading?: boolean
}

const statusOptions = [
	{ label: 'Hoạt động', value: 'active' },
	{ label: 'Ẩn', value: 'hidden' },
	{ label: 'Đã gỡ', value: 'removed' },
]

const visibilityOptions = [
	{ label: 'Công khai', value: 'public' },
	{ label: 'Người theo dõi', value: 'followers' },
	{ label: 'Riêng tư', value: 'private' },
]

export default function SearchAdminPost({ onSearch, loading = false }: SearchAdminPostProps) {
	const [form] = Form.useForm<SearchPostFormValues>()

	const handleSearch = (values: SearchPostFormValues) => {
		const { date_range: dateRange, ...formValues } = values
		const params = Object.fromEntries(
			Object.entries(formValues).filter(([, value]) => value !== undefined && value !== null && value !== ''),
		) as FindPostParams

		if (dateRange?.[0]) params.from = dateRange[0].startOf('day').toISOString()
		if (dateRange?.[1]) params.to = dateRange[1].endOf('day').toISOString()

		onSearch(params)
	}

	return (
		<Form form={form} layout="vertical" onFinish={handleSearch}>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
				<Form.Item label="ID bài viết" name="post_id">
					<Input allowClear placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Từ khóa" name="keyword">
					<Input allowClear placeholder="Nội dung hoặc hashtag" />
				</Form.Item>
				<Form.Item label="ID người đăng" name="user_id">
					<Input allowClear placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Thời gian tạo" name="date_range">
					<DatePicker.RangePicker style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item label="Trạng thái" name="status">
					<Select allowClear placeholder="Không lọc" options={statusOptions} />
				</Form.Item>
				<Form.Item label="Chế độ hiển thị" name="visibility">
					<Select allowClear placeholder="Không lọc" options={visibilityOptions} />
				</Form.Item>

				<Form.Item label="Like tối thiểu" name="like_count_min">
					<InputNumber min={0} style={{ width: '100%' }} placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Like tối đa" name="like_count_max">
					<InputNumber min={0} style={{ width: '100%' }} placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Reply tối thiểu" name="reply_count_min">
					<InputNumber min={0} style={{ width: '100%' }} placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Reply tối đa" name="reply_count_max">
					<InputNumber min={0} style={{ width: '100%' }} placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Repost tối thiểu" name="repost_count_min">
					<InputNumber min={0} style={{ width: '100%' }} placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Repost tối đa" name="repost_count_max">
					<InputNumber min={0} style={{ width: '100%' }} placeholder="Không lọc" />
				</Form.Item>
			</div>

			<Button type="primary" htmlType="submit" loading={loading}>
				Tìm bài viết
			</Button>
		</Form>
	)
}
