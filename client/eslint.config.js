import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 允许 shadcn/ui 组件导出非组件内容（如 cn 工具函数、slot 等）
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['cn', 'buttonVariants', 'badgeVariants', 'FormField', 'FormMessage', 'FormDescription', 'TabsList', 'TabsTrigger', 'TabsContent'] },
      ],
      // 允许未使用的变量以下划线开头
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
