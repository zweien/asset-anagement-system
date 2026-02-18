import { Request, Response } from 'express'
import { AIService, ChatMessage } from '../services/ai.service'
import { SystemConfigService } from '../services/system-config.service'
import { getUserRateLimitStatus } from '../middleware/ai-rate-limit'

// 聊天接口
export const chat = async (req: Request, res: Response) => {
  try {
    // 检查 AI 服务是否可用
    const isAvailable = await AIService.isAvailable()
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        error: 'AI 服务未配置，请在系统设置中配置 API Key',
      })
    }

    const { messages } = req.body as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的消息',
      })
    }

    // 验证消息格式
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({
          success: false,
          error: '消息格式无效',
        })
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        return res.status(400).json({
          success: false,
          error: '不支持的消息角色',
        })
      }
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    // 调用 AI 服务
    const result = await AIService.chat(messages)

    // 使用 fullStream 处理文本和工具调用
    try {
      for await (const part of result.fullStream) {
        switch (part.type) {
          case 'text-delta':
            res.write(`data: ${JSON.stringify({ content: part.text })}\n\n`)
            break
          case 'tool-call':
            // 工具调用开始
            res.write(`data: ${JSON.stringify({ toolCall: { id: part.toolCallId, name: part.toolName, input: part.input } })}\n\n`)
            break
          case 'tool-result':
            // 工具调用结果
            res.write(`data: ${JSON.stringify({ toolResult: { id: part.toolCallId, name: part.toolName, result: part.output } })}\n\n`)
            break
          case 'error':
            res.write(`data: ${JSON.stringify({ error: part.error })}\n\n`)
            break
        }
      }
      res.write('data: [DONE]\n\n')
    } catch (streamError) {
      console.error('[AI] 流处理错误:', streamError)
      res.write(`data: ${JSON.stringify({ error: streamError instanceof Error ? streamError.message : '流处理错误' })}\n\n`)
    }

    res.end()
  } catch (error) {
    console.error('[AI] 聊天错误:', error)

    // 如果响应头还未发送，返回错误 JSON
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'AI 服务内部错误',
      })
    }

    // 否则通过 SSE 发送错误
    res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'AI 服务内部错误' })}\n\n`)
    res.end()
  }
}

// 获取 AI 配置状态
export const getStatus = async (req: Request, res: Response) => {
  try {
    const config = await AIService.getConfigStatus()
    const user = (req as any).user
    const rateLimitStatus = user ? getUserRateLimitStatus(user.id) : null

    return res.json({
      success: true,
      data: {
        ...config,
        rateLimit: rateLimitStatus,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '获取 AI 状态失败',
    })
  }
}

// 获取 AI 配置（仅管理员）
export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await SystemConfigService.getAIConfig()
    // 脱敏 API Key，只显示前后几位
    const maskedApiKey = config.apiKey
      ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
      : ''

    return res.json({
      success: true,
      data: {
        ...config,
        apiKey: maskedApiKey,
        hasApiKey: !!config.apiKey,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '获取 AI 配置失败',
    })
  }
}

// 更新 AI 配置（仅管理员）
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { apiKey, baseUrl, model, maxTokens, apiType } = req.body

    // 验证输入
    const updateData: {
      apiKey?: string
      baseUrl?: string
      model?: string
      maxTokens?: number
      apiType?: string
    } = {}

    if (apiKey !== undefined && apiKey !== '') {
      // 如果是脱敏后的值，不更新
      if (!apiKey.includes('...')) {
        updateData.apiKey = apiKey
      }
    }

    if (baseUrl !== undefined) {
      updateData.baseUrl = baseUrl
    }

    if (model !== undefined) {
      updateData.model = model
    }

    if (maxTokens !== undefined) {
      const tokens = parseInt(String(maxTokens), 10)
      if (isNaN(tokens) || tokens < 100 || tokens > 10000) {
        return res.status(400).json({
          success: false,
          error: 'maxTokens 必须在 100-10000 之间',
        })
      }
      updateData.maxTokens = tokens
    }

    if (apiType !== undefined) {
      if (!['chat', 'responses'].includes(apiType)) {
        return res.status(400).json({
          success: false,
          error: 'apiType 必须是 chat 或 responses',
        })
      }
      updateData.apiType = apiType
    }

    const result = await SystemConfigService.setAIConfig(updateData)

    return res.json({
      success: true,
      data: result.data,
      message: 'AI 配置更新成功',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新 AI 配置失败',
    })
  }
}

// 测试 AI 配置连接（仅管理员）
export const testConfig = async (req: Request, res: Response) => {
  try {
    const { apiKey, baseUrl, model, apiType } = req.body

    // 构建测试配置（只使用提供的值）
    const testConfig: { apiKey?: string; baseUrl?: string; model?: string; apiType?: 'chat' | 'responses' } = {}

    if (apiKey && !apiKey.includes('...')) {
      testConfig.apiKey = apiKey
    }
    if (baseUrl) {
      testConfig.baseUrl = baseUrl
    }
    if (model) {
      testConfig.model = model
    }
    if (apiType && (apiType === 'chat' || apiType === 'responses')) {
      testConfig.apiType = apiType
    }

    const result = await AIService.testConnection(
      Object.keys(testConfig).length > 0 ? testConfig : undefined
    )

    return res.json({
      success: result.success,
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '测试连接失败',
    })
  }
}
