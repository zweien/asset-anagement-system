import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'

// 用户类型 - 与后端返回的数据结构一致
export interface User {
  id: string
  username: string
  name: string | null
  email: string | null
  avatar: string | null
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  updateUser: (user: Partial<User>) => void
  refreshUser: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        // 同步到 localStorage 以兼容现有代码
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ token, user, isAuthenticated: true })
      },
      updateUser: (userData) => {
        set((state) => {
          if (!state.user) return state
          const updatedUser = { ...state.user, ...userData }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          return { user: updatedUser }
        })
      },
      refreshUser: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await authApi.getCurrentUser()
          if (response.success && response.data) {
            const updatedUser = response.data as User
            localStorage.setItem('user', JSON.stringify(updatedUser))
            set({ user: updatedUser })
          }
        } catch (err) {
          console.error('刷新用户信息失败:', err)
        }
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// 辅助函数 - 兼容现有代码
export const getToken = () => useAuthStore.getState().token
export const getUser = () => useAuthStore.getState().user
export const isLoggedIn = () => useAuthStore.getState().isAuthenticated
