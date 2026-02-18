import { streamText, tool, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { SqlQueryService } from './sql-query.service'
import { getSystemPrompt } from '../prompts/system-prompt'
import { SystemConfigService } from './system-config.service'

// 消息类型
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// AI 配置类型
export interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  apiType: 'chat' | 'responses'
}

// SQL 执行工具
const executeSqlTool = tool({
  description: '执行 SQL SELECT 查询来获取资产数据。只能执行 SELECT 语句，不能执行 INSERT、UPDATE、DELETE 等修改操作。',
  inputSchema: z.object({
    sql: z.string().describe('要执行的 SQL SELECT 查询语句'),
    reason: z.string().describe('执行这个查询的原因'),
  }),
  execute: async ({ sql, reason }: { sql: string; reason: string }) => {
    console.log(`[AI] 执行 SQL 查询: ${sql}`)
    console.log(`[AI] 查询原因: ${reason}`)

    const result = await SqlQueryService.executeQuery(sql)

    if (!result.success) {
      return {
        success: false,
        error: result.error || '查询执行失败',
      }
    }

    return {
      success: true,
      data: result.data,
      rowCount: result.rowCount,
      columns: result.columns,
      executionTime: result.executionTime,
    }
  },
})

// 导入 streamText 返回类型
import type { StreamTextResult } from 'ai'

// AI 服务返回类型 - 直接使用 streamText 的返回类型
export type AIChatResult = StreamTextResult<any, any>

// AI 服务
export const AIService = {
  // 获取 AI 配置
  async getConfig(): Promise<AIConfig> {
    return SystemConfigService.getAIConfig()
  },

  // 流式聊天
  async chat(messages: ChatMessage[]): Promise<AIChatResult> {
    const config = await this.getConfig()

    if (!config.apiKey) {
      throw new Error('AI 服务未配置，请在系统设置中配置 API Key')
    }

    const openai = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    })

    const systemPrompt = await getSystemPrompt()

    // 根据 apiType 选择模型调用方式
    const model = config.apiType === 'responses'
      ? openai.responses(config.model)  // 使用 Responses API
      : openai.chat(config.model)       // 使用 Chat Completions API（默认）

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      tools: {
        executeSql: executeSqlTool,
      },
      stopWhen: stepCountIs(3), // 最多执行 3 次工具调用
    })

    return result
  },

  // 检查 AI 服务是否可用
  async isAvailable(): Promise<boolean> {
    const config = await this.getConfig()
    return !!config.apiKey
  },

  // 获取配置信息（用于状态 API）
  async getConfigStatus() {
    const config = await this.getConfig()
    return {
      model: config.model,
      maxTokens: config.maxTokens,
      available: !!config.apiKey,
      // 不返回 API Key
    }
  },

  // 验证 AI 配置是否有效
  async testConnection(config?: Partial<AIConfig>): Promise<{
    success: boolean
    message: string
    model?: string
    responseTime?: number
  }> {
    try {
      const testConfig = config
        ? { ...await this.getConfig(), ...config }
        : await this.getConfig()

      if (!testConfig.apiKey) {
        return {
          success: false,
          message: 'API Key 未配置',
        }
      }

      const openai = createOpenAI({
        apiKey: testConfig.apiKey,
        baseURL: testConfig.baseUrl,
      })

      const startTime = Date.now()

      // 发送一个简单的测试请求
      const response = await fetch(`${testConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: testConfig.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`
        return {
          success: false,
          message: `连接失败: ${errorMessage}`,
          responseTime,
        }
      }

      return {
        success: true,
        message: '连接成功',
        model: testConfig.model,
        responseTime,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接测试失败',
      }
    }
  },
}
