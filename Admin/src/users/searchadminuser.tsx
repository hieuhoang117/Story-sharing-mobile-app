import { Button, DatePicker, Form, Input, Select } from 'antd'
import type { Dayjs } from 'dayjs'

export type FindUserParams = {
	user_id?: string
	username?: string
	email?: string
	display_name?: string
	keyword?: string
	role?: 'user' | 'moderator' | 'admin'
	status?: 'active' | 'suspended' | 'banned'
	is_private?: 0 | 1
	is_verified?: 0 | 1
	from?: string
	to?: string
}

type SearchUserFormValues = Omit<FindUserParams, 'from' | 'to' | 'is_private' | 'is_verified'> & {
	date_range?: [Dayjs | null, Dayjs | null] | null
	is_private?: '0' | '1' | undefined
	is_verified?: '0' | '1' | undefined
}

type SearchAdminUserProps = {
	onSearch: (params: FindUserParams) => void
	loading?: boolean
}

const roleOptions = [
	{ label: 'Người dùng', value: 'user' },
	{ label: 'Điều hành viên', value: 'moderator' },
	{ label: 'Quản trị viên', value: 'admin' },
]

const statusOptions = [
	{ label: 'Hoạt động', value: 'active' },
	{ label: 'Tạm ngưng', value: 'suspended' },
	{ label: 'Cấm', value: 'banned' },
]

const privacyOptions = [
	{ label: 'Công khai', value: '0' },
	{ label: 'Riêng tư', value: '1' },
]

const verificationOptions = [
	{ label: 'Chưa xác minh', value: '0' },
	{ label: 'Đã xác minh', value: '1' },
]

export default function SearchAdminUser({ onSearch, loading = false }: SearchAdminUserProps) {
	const [form] = Form.useForm<SearchUserFormValues>()

	const handleSearch = (values: SearchUserFormValues) => {
		const { date_range: dateRange, ...formValues } = values
		const params = Object.fromEntries(
			Object.entries(formValues).filter(([, value]) => value !== undefined && value !== null && value !== ''),
		) as Record<string, string | number>

		if (dateRange?.[0]) params.from = dateRange[0].startOf('day').toISOString()
		if (dateRange?.[1]) params.to = dateRange[1].endOf('day').toISOString()
		if (params.is_private !== undefined) params.is_private = Number(params.is_private) as 0 | 1
		if (params.is_verified !== undefined) params.is_verified = Number(params.is_verified) as 0 | 1

		onSearch(params as FindUserParams)
	}

	return (
		<Form form={form} layout="vertical" onFinish={handleSearch}>
			<div className="admin-user-search-grid">
				<Form.Item label="ID người dùng" name="user_id">
					<Input allowClear placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Username" name="username">
					<Input allowClear placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Email" name="email">
					<Input allowClear placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Tên hiển thị" name="display_name">
					<Input allowClear placeholder="Không lọc" />
				</Form.Item>
				<Form.Item label="Từ khóa" name="keyword">
					<Input allowClear placeholder="Tên, email hoặc username" />
				</Form.Item>
				<Form.Item label="Thời gian tạo" name="date_range">
					<DatePicker.RangePicker style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item label="Vai trò" name="role">
					<Select allowClear placeholder="Không lọc" options={roleOptions} />
				</Form.Item>
				<Form.Item label="Trạng thái" name="status">
					<Select allowClear placeholder="Không lọc" options={statusOptions} />
				</Form.Item>
				<Form.Item label="Quyền riêng tư" name="is_private">
					<Select allowClear placeholder="Không lọc" options={privacyOptions} />
				</Form.Item>
				<Form.Item label="Xác minh tài khoản" name="is_verified">
					<Select allowClear placeholder="Không lọc" options={verificationOptions} />
				</Form.Item>
			</div>

			<Button className="admin-user-search-button" type="primary" htmlType="submit" loading={loading}>
				Tìm người dùng
			</Button>
		</Form>
	)
}
