import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Dashboard, Assets, Import, Reports, Settings, UserManagement } from './pages'
import { AssetDetail } from './pages/AssetDetail'
import { Logs } from './pages/Logs'
import { Login } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页 - 不需要认证 */}
        <Route path="/login" element={<Login />} />

        {/* 需要认证的路由 */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/import" element={<Import />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />

          {/* 管理员专属路由 */}
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
