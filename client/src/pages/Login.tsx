import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi, setToken, setUser } from '../lib/api'

// 密码复杂度验证函数
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('至少8位')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('包含小写字母')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('包含大写字母')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('包含数字')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function Login() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response
      if (isLogin) {
        response = await authApi.login({
          username: formData.username,
          password: formData.password,
        })
      } else {
        // 注册时验证密码复杂度
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.valid) {
          setError(`密码不符合要求: 需要${passwordValidation.errors.join('、')}`)
          setLoading(false)
          return
        }
        response = await authApi.register({
          username: formData.username,
          password: formData.password,
          name: formData.name || undefined,
          email: formData.email || undefined,
        })
      }

      if (response.success && response.data) {
        setToken(response.data.token)
        setUser(response.data.user)
        navigate('/')
      } else {
        setError(response.error || '操作失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              资产管理系统
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isLogin ? '登录您的账户' : '创建新账户'}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isLogin ? "请输入密码" : "请输入密码（至少8位，包含大小写字母和数字）"}
                required
                minLength={isLogin ? 1 : 8}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  密码要求：至少8位，包含大写字母、小写字母和数字
                </p>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    姓名（可选）
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    邮箱（可选）
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入邮箱"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? (
              <>
                还没有账户？{' '}
                <button
                  onClick={() => {
                    setIsLogin(false)
                    setError('')
                  }}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账户？{' '}
                <button
                  onClick={() => {
                    setIsLogin(true)
                    setError('')
                  }}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  立即登录
                </button>
              </>
            )}
          </div>

          {/* 默认账户提示 */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">默认管理员账户：</p>
            <p>用户名：admin</p>
            <p>密码：admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
