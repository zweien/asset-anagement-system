import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { EditorRoute } from './components/PermissionRoute'
import { PageLoader } from './components/ui/PageLoader'

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Assets = lazy(() => import('./pages/Assets').then(m => ({ default: m.Assets })))
const AssetDetail = lazy(() => import('./pages/AssetDetail').then(m => ({ default: m.AssetDetail })))
const Import = lazy(() => import('./pages/Import').then(m => ({ default: m.Import })))
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))
const UserManagement = lazy(() => import('./pages/UserManagement').then(m => ({ default: m.UserManagement })))
const Logs = lazy(() => import('./pages/Logs').then(m => ({ default: m.Logs })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))

function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      <Routes>
        {/* 登录页 - 不需要认证 */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          }
        />

        {/* 需要认证的路由 */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* 所有认证用户可访问 */}
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/assets"
            element={
              <Suspense fallback={<PageLoader />}>
                <Assets />
              </Suspense>
            }
          />
          <Route
            path="/assets/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <AssetDetail />
              </Suspense>
            }
          />
          <Route
            path="/reports"
            element={
              <Suspense fallback={<PageLoader />}>
                <Reports />
              </Suspense>
            }
          />

          {/* 录入员及以上权限 */}
          <Route
            path="/import"
            element={
              <EditorRoute>
                <Suspense fallback={<PageLoader />}>
                  <Import />
                </Suspense>
              </EditorRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <EditorRoute>
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              </EditorRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <EditorRoute>
                <Suspense fallback={<PageLoader />}>
                  <Logs />
                </Suspense>
              </EditorRoute>
            }
          />

          {/* 管理员专属路由 */}
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <UserManagement />
                </Suspense>
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
