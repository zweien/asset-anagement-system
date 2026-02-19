import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('should handle conflicting tailwind classes', () => {
    // tailwind-merge 应该让后面的类覆盖前面的类
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('should handle conditional classes', () => {
    const showConditional = true
    const showHidden = false
    expect(cn('base-class', showConditional && 'conditional-class', showHidden && 'hidden-class')).toBe(
      'base-class conditional-class'
    )
  })

  it('should handle arrays and objects', () => {
    expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe(
      'class1 class2 class3'
    )
  })

  it('should filter out undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })
})
