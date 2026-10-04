import {
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Avatar, Button, ConfigProvider, Layout, Menu, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import './App.css'
import AdminPost from './posts/adminpost'
import AdminReport from './reports/adminrepost'
import AdminUser from './users/adminuser'



const { Sider, Header, Content } = Layout
const { Text} = Typography

type AdminPage = 'reports' | 'posts' | 'users'

const menuItems: MenuProps['items'] = [
  { key: 'reports', icon: <WarningOutlined />, label: 'Quản lý vi phạm' },
  { key: 'posts', icon: <FileTextOutlined />, label: 'Quản lý bài đăng' },
  { key: 'users', icon: <TeamOutlined />, label: 'Quản lý người dùng' },
]

const pageTitles: Record<AdminPage, string> = {
  reports: 'Quản lý vi phạm',
  posts: 'Quản lý bài đăng',
  users: 'Quản lý người dùng',
}
const pageComponents: Record<AdminPage, React.ReactNode> = {
  reports: <AdminReport />,
  posts: <AdminPost />,
  users: <AdminUser />,
}

function App() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState<AdminPage>('reports')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#167d70',
          colorText: '#202a27',
          borderRadius: 6,
          fontFamily: 'Inter, "Segoe UI", sans-serif',
        },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: '#214a43',
            darkItemSelectedColor: '#ffffff',
            darkItemHoverBg: '#1d3934',
          },
        },
      }}
    >
      <Layout className="admin-shell">
        <Sider
          className="admin-sider"
          width={248}
          collapsedWidth={76}
          collapsed={collapsed}
          breakpoint="md"
          onBreakpoint={setCollapsed}
          onCollapse={setCollapsed}
        >
          <div className="brand-block">
            <div className="brand-mark">S</div>
            {!collapsed && (
              <div className="brand-copy">
                <Text className="brand-name">StoryShare</Text>
                <Text className="brand-caption">ADMIN CONSOLE</Text>
              </div>
            )}
          </div>

          <Text className="menu-caption">QUẢN TRỊ</Text>
          <Menu
            className="admin-menu"
            mode="inline"
            theme="dark"
            selectedKeys={[activePage]}
            items={menuItems}
            onClick={({ key }) => setActivePage(key as AdminPage)}
          />

          <div className="sider-footer">
            <Avatar size={34} className="admin-avatar">AD</Avatar>
            {!collapsed && (
              <div className="admin-identity">
                <Text className="admin-name">Quản trị viên</Text>
                <Text className="admin-role">Admin</Text>
              </div>
            )}
          </div>
          <Button onClick={() => navigate('/login')}>Đăng xuất</Button>
        </Sider>

        <Layout className="admin-main">
          <Header className="admin-header">
            <div className="header-left">
              <Button
                type="text"
                className="collapse-button"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
                onClick={() => setCollapsed((value) => !value)}
              />
              <div className="header-heading">
                <Text className="header-kicker">STORYSHARE / QUẢN TRỊ</Text>
                <Text className="header-title">{pageTitles[activePage]}</Text>
              </div>
            </div>
            <div className="header-account">
              <Avatar size={34} className="header-avatar">AD</Avatar>
            </div>
          </Header>

          <Content className="admin-content">
            <section className="page-canvas" aria-label={pageTitles[activePage]} >
              {pageComponents[activePage]}
            </section>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
