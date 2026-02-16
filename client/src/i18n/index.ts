import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

// 从 localStorage 获取保存的语言偏好
const savedLanguage = localStorage.getItem('language') || 'zh-CN'

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': {
      translation: zhCN,
    },
    'en-US': {
      translation: enUS,
    },
  },
  lng: savedLanguage,
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false,
  },
})

// 监听语言变化，保存到 localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n

// 语言选项
export const languages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
]

// 获取当前语言
export const getCurrentLanguage = () => i18n.language

// 切换语言
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng)
}
