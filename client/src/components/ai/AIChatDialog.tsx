import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Send, Trash2, Loader2, Database, Download, FileText, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { aiApi } from '@/lib/ai-api'
import type { AIMessage, ToolInvocation } from '@/lib/ai-api'
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'

interface AIChatDialogProps {
  isOpen: boolean
  onClose: () => void
}

// 生成唯一 ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function AIChatDialog({ isOpen, onClose }: AIChatDialogProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 打开对话框时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setError(null)
    setIsLoading(true)

    // 创建 AI 响应消息占位
    const aiMessageId = generateId()
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'assistant',
      content: '',
    }])

    try {
      // 构建请求消息（不包含空内容的消息）
      const requestMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      let fullContent = ''

      // 流式接收响应
      for await (const chunk of aiApi.streamChat(requestMessages)) {
        if (chunk.error) {
          setError(chunk.error)
          break
        }
        fullContent += chunk.content
        setMessages(prev => prev.map(m =>
          m.id === aiMessageId
            ? { ...m, content: fullContent }
            : m
        ))
        if (chunk.done) break
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('ai.sendFailed')
      setError(errorMsg)
      setMessages(prev => prev.map(m =>
        m.id === aiMessageId
          ? { ...m, content: t('ai.errorOccurred') }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }

  // 快捷问题点击
  const handleQuickQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  // 清空对话
  const clearMessages = () => {
    setMessages([])
    setError(null)
  }

  // 导出为 Markdown
  const exportToMarkdown = () => {
    if (messages.length === 0) return

    const timestamp = new Date().toISOString().split('T')[0]
    let markdown = `# AI 对话记录\n\n导出时间：${new Date().toLocaleString()}\n\n---\n\n`

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? '👤 用户' : '🤖 AI 助手'
      markdown += `### ${role}\n\n${msg.content}\n\n`

      // 如果有工具调用结果，也导出
      if (msg.toolInvocations?.length) {
        markdown += `**SQL 查询结果:**\n\n`
        msg.toolInvocations.forEach((tool) => {
          if (tool.result?.data) {
            markdown += '```\n'
            markdown += JSON.stringify(tool.result.data, null, 2)
            markdown += '\n```\n\n'
          }
        })
      }
    })

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI对话_${timestamp}.md`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // 导出为 JSON
  const exportToJSON = () => {
    if (messages.length === 0) return

    const timestamp = new Date().toISOString().split('T')[0]
    const exportData = {
      exportTime: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        toolInvocations: msg.toolInvocations,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI对话_${timestamp}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('ai.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] border rounded-lg bg-muted/30 p-4">
          {/* 欢迎消息 */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Sparkles className="w-12 h-12 text-primary/50" />
              <p className="text-muted-foreground">{t('ai.welcome')}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(t('ai.quickQuestions.status'))}
                >
                  {t('ai.quickQuestions.status')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(t('ai.quickQuestions.recent'))}
                >
                  {t('ai.quickQuestions.recent')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(t('ai.quickQuestions.category'))}
                >
                  {t('ai.quickQuestions.category')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(t('ai.quickQuestions.statistics'))}
                >
                  {t('ai.quickQuestions.statistics')}
                </Button>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'mb-4 flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    {t('ai.assistant')}
                  </div>
                )}
                <div className="text-sm">
                  {message.content ? (
                    message.role === 'assistant' ? (
                      <Streamdown
                        plugins={{ code }}
                        caret="block"
                        isAnimating={isLoading && messages.indexOf(message) === messages.length - 1}
                        className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:p-3 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
                      >
                        {message.content}
                      </Streamdown>
                    ) : (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    )
                  ) : (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('ai.thinking')}
                    </span>
                  )}
                </div>
                {/* SQL 结果展示 */}
                {message.toolInvocations?.map((tool) => (
                  <SqlResultTable key={tool.toolCallId} tool={tool} />
                ))}
              </div>
            </div>
          ))}

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ai.inputPlaceholder')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>

          {/* 导出按钮 */}
          {messages.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={t('ai.export')}>
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToMarkdown}>
                  <FileText className="w-4 h-4 mr-2" />
                  {t('ai.exportMarkdown')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  {t('ai.exportJSON')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 清空按钮 */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              title={t('ai.clearChat')}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// SQL 结果表格组件
function SqlResultTable({ tool }: { tool: ToolInvocation }) {
  const { t } = useTranslation()

  if (!tool.result || !tool.result.success || !tool.result.data) {
    return null
  }

  const { data, columns, rowCount, executionTime } = tool.result

  return (
    <div className="mt-3 border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 text-xs">
        <Database className="w-3 h-3" />
        <span>{t('ai.sqlResult', { count: rowCount })}</span>
        {executionTime && (
          <span className="text-muted-foreground">
            ({t('ai.executionTime', { time: executionTime })})
          </span>
        )}
      </div>
      <div className="max-h-40 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/30">
            <tr>
              {columns?.map((col) => (
                <th key={col} className="px-2 py-1 text-left font-medium whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns?.map((col) => (
                  <td key={col} className="px-2 py-1 whitespace-nowrap max-w-[150px] truncate">
                    {typeof row[col] === 'object'
                      ? JSON.stringify(row[col])
                      : String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 20 && (
          <div className="px-2 py-1 text-xs text-muted-foreground bg-muted/30">
            {t('ai.resultLimited', { count: 20, total: data.length })}
          </div>
        )}
      </div>
    </div>
  )
}
