import 'antd/dist/reset.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Login from './Login/login.tsx'
import AdminPost from './posts/adminpost.tsx'
import AdminReport from './reports/adminrepost.tsx'
import AdminUser from './users/adminuser.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<App />}>
          <Route path="reports" element={<AdminReport />} />
          <Route path="posts" element={<AdminPost />} />
          <Route path="users" element={<AdminUser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)