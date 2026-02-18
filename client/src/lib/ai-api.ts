import { axiosInstance } from './api'

// AI 消息类型
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolInvocations?: ToolInvocation[]
}

// 工具调用类型
export interface ToolInvocation {
  toolCallId: string
  toolName: string
  args: {
    sql: string
    reason: string
  }
  result?: {
    success: boolean
    data?: Array<Record<string, unknown>>
    error?: string
    rowCount?: number
    columns?: string[]
    executionTime?: number
  }
}

// AI 状态类型
export interface AIStatus {
  model: string
  maxTokens: number
  available: boolean
  rateLimit?: {
    minuteRemaining: number
    dailyRemaining: number
  }
}

// AI 配置类型
export interface AIConfig {
  apiKey: string
  hasApiKey: boolean
  baseUrl: string
  model: string
  maxTokens: number
  apiType: 'chat' | 'responses'
}

// 流式聊天响应
export interface StreamChatResponse {
  content: string
  done: boolean
  error?: string
}

// AI API
export const aiApi = {
  // 流式聊天
  async *streamChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>): AsyncGenerator<StreamChatResponse> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未登录')
    }

    const response = await fetch('http://localhost:3002/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '请求失败')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            yield { content: '', done: true }
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              yield { content: '', done: false, error: parsed.error }
              return
            }
            yield { content: parsed.content || '', done: false }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  },

  // 获取 AI 状态
  async getStatus(): Promise<{ success: boolean; data?: AIStatus; error?: string }> {
    return axiosInstance.get('/ai/status')
  },

  // 获取 AI 配置
  async getConfig(): Promise<{ success: boolean; data?: AIConfig; error?: string }> {
    return axiosInstance.get('/ai/config')
  },

  // 更新 AI 配置
  async updateConfig(config: Partial<{
    apiKey: string
    baseUrl: string
    model: string
    maxTokens: number
    apiType: 'chat' | 'responses'
  }>): Promise<{ success: boolean; data?: AIConfig; error?: string; message?: string }> {
    return axiosInstance.put('/ai/config', config)
  },

  // 测试 AI 配置连接
  async testConfig(config?: Partial<{
    apiKey: string
    baseUrl: string
    model: string
    apiType: 'chat' | 'responses'
  }>): Promise<{
    success: boolean
    data?: {
      success: boolean
      message: string
      model?: string
      responseTime?: number
    }
    error?: string
  }> {
    return axiosInstance.post('/ai/config/test', config || {})
  },
}
