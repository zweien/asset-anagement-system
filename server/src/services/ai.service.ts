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

// AI 服务返回类型
export interface AIChatResult {
  toTextStreamResponse: () => Response
}

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

    const result = streamText({
      model: openai(config.model),
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
}
