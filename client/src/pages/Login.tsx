import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, Github } from 'lucide-react'
import { authApi } from '../lib/api'
import { useAuthStore } from '@/stores/authStore'

export function Login() {
  const { t } = useTranslation()
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

  // 使用 Zustand store
  const { setAuth } = useAuthStore()

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
        // 简单验证
        if (formData.password.length < 8) {
          setError(t('login.passwordRequirements'))
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
        setAuth(response.data.token, response.data.user)
        navigate('/')
      } else {
        setError(response.error || t('common.error'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
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
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="w-8 h-8 text-blue-500" />
              <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('login.appName')}
              </Link>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {isLogin ? t('login.loginTitle') : t('login.registerTitle')}
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
                {t('login.username')}
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('login.usernamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isLogin ? t('login.passwordPlaceholder') : t('login.passwordPlaceholderRegister')}
                required
                minLength={isLogin ? 1 : 8}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('login.passwordRequirements')}
                </p>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('login.name')} {t('common.optional')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('login.email')} {t('common.optional')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.emailPlaceholder')}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? t('login.processing') : (isLogin ? t('login.loginButton') : t('login.registerButton'))}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? (
              <>
                {t('login.noAccount')}{' '}
                <button
                  onClick={() => {
                    setIsLogin(false)
                    setError('')
                  }}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  {t('login.registerNow')}
                </button>
              </>
            ) : (
              <>
                {t('login.hasAccount')}{' '}
                <button
                  onClick={() => {
                    setIsLogin(true)
                    setError('')
                  }}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  {t('login.loginNow')}
                </button>
              </>
            )}
          </div>

          {/* 默认账户提示 */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">{t('login.defaultAccount')}</p>
            <p>{t('login.username')}: admin</p>
            <p>{t('login.password')}: admin123</p>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="flex items-center justify-center gap-1">
            © {new Date().getFullYear()} Asset Management System
          </p>
          <a
            href="https://github.com/zweien/asset-anagement-system"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
