import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input, Typography } from 'antd'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contextAdmin/AuthContext'
import './login.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

type LoginFormValues = {
    email: string
    password: string
}

type LoginResponse = {
    data?: {
        token?: string
        role?: string
    }
    message?: string
    error?: string
}

export default function Login() {
    const navigate = useNavigate()
    const { setToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleLogin = async ({ email, password }: LoginFormValues) => {
        setLoading(true)
        setErrorMessage('')

        try {
            const response = await axios.post<LoginResponse>(`${API_BASE_URL}/users/login`, {
                email: email.trim(),
                password,
            })
            const user = response.data.data

            if (user?.role !== 'admin') {
                setErrorMessage('Tài khoản này không có quyền quản trị.')
                return
            }
            if (!user.token) {
                setErrorMessage('Máy chủ không trả về token đăng nhập.')
                return
            }

            setToken(user.token)
            navigate('/admin', { replace: true })
        } catch (error) {
            if (axios.isAxiosError<LoginResponse>(error)) {
                setErrorMessage(error.response?.data?.error || error.response?.data?.message || 'Không thể đăng nhập. Vui lòng thử lại.')
            } else {
                
                setErrorMessage('Không thể kết nối tới máy chủ.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="admin-login-page">
            <section className="admin-login-panel" aria-labelledby="admin-login-title">
                <div className="admin-login-brand">
                    <span className="admin-login-mark" aria-hidden="true">S</span>
                    <div>
                        <Typography.Text className="admin-login-brand-name">StoryShare</Typography.Text>
                        <Typography.Text className="admin-login-brand-caption">ADMIN CONSOLE</Typography.Text>
                    </div>
                </div>

                <div className="admin-login-heading">
                    <Typography.Title level={2} id="admin-login-title">Đăng nhập quản trị</Typography.Title>
                    <Typography.Paragraph>Đăng nhập bằng tài khoản có quyền admin.</Typography.Paragraph>
                </div>

                <Form<LoginFormValues> layout="vertical" onFinish={handleLogin} requiredMark={false}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email.' },
                            { type: 'email', message: 'Email không hợp lệ.' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="admin@example.com"
                            autoComplete="username"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu"
                            autoComplete="current-password"
                            size="large"
                        />
                    </Form.Item>

                    {errorMessage && (
                        <Alert className="admin-login-error" type="error" showIcon message={errorMessage} />
                    )}

                    <Button className="admin-login-submit" type="primary" htmlType="submit" loading={loading} block size="large">
                        Đăng nhập
                    </Button>
                </Form>
            </section>
        </main>
    )
}