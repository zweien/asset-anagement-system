import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PageInstructionsProps {
  title: string
  instructions: string[]
  storageKey?: string
}

export function PageInstructions({ title, instructions, storageKey }: PageInstructionsProps) {
  const key = storageKey || `page-instructions-${title}`

  // 使用惰性初始化从 localStorage 读取初始状态
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = localStorage.getItem(key)
    return stored === null ? true : stored === 'true'
  })

  const handleToggle = () => {
    const newValue = !isVisible
    setIsVisible(newValue)
    localStorage.setItem(key, String(newValue))
  }

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="text-muted-foreground"
      >
        <Info className="w-4 h-4 mr-1" />
        显示使用说明
      </Button>
    )
  }

  return (
    <Card className="mb-6 border-border/50 bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">-</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleToggle}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
