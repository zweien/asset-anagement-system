import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  sanitizeObject,
  sanitizeDynamicData,
  containsXSS,
  escapeHtml,
} from '../../utils/sanitize'

describe('XSS Sanitization', () => {
  describe('sanitizeString', () => {
    it('应该移除 script 标签', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeString(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Hello')
    })

    it('应该处理带有特殊字符的文本', () => {
      const input = 'Hello <World> & Friends'
      const result = sanitizeString(input)
      // xss 库会处理危险标签，但保留普通文本
      expect(result).toContain('Hello')
    })

    it('应该保留纯文本', () => {
      const input = 'Hello World'
      const result = sanitizeString(input)
      expect(result).toBe('Hello World')
    })

    it('应该处理空字符串', () => {
      expect(sanitizeString('')).toBe('')
    })

    it('应该移除事件处理器', () => {
      const input = '<img onclick="alert(1)" src="x">'
      const result = sanitizeString(input)
      expect(result.toLowerCase()).not.toContain('onclick')
    })
  })

  describe('sanitizeObject', () => {
    it('应该清理对象中的字符串值', () => {
      const obj = {
        name: '<script>alert("xss")</script>Test',
        age: 25,
      }
      const result = sanitizeObject(obj)
      expect(result.name).not.toContain('<script>')
      expect(result.age).toBe(25)
    })

    it('应该递归清理嵌套对象', () => {
      const obj = {
        user: {
          name: '<script>xss</script>User',
        },
      }
      const result = sanitizeObject(obj)
      expect(result.user.name).not.toContain('<script>')
    })

    it('应该处理数组', () => {
      const arr = ['<script>xss</script>', 'safe', '<b>bold</b>']
      const result = sanitizeObject(arr)
      expect(result[0]).not.toContain('<script>')
      expect(result[1]).toBe('safe')
    })

    it('应该处理 null 和 undefined', () => {
      expect(sanitizeObject(null)).toBeNull()
      expect(sanitizeObject(undefined)).toBeUndefined()
    })
  })

  describe('sanitizeDynamicData', () => {
    it('应该清理动态字段的值', () => {
      const data = {
        field1: '<script>alert(1)</script>value',
        field2: 'normal value',
        field3: 123,
      }
      const result = sanitizeDynamicData(data)
      expect(result.field1).not.toContain('<script>')
      expect(result.field2).toBe('normal value')
      expect(result.field3).toBe(123)
    })

    it('应该清理数组值', () => {
      const data = {
        tags: ['<script>xss</script>', 'safe-tag'],
      }
      const result = sanitizeDynamicData(data)
      expect(result.tags[0]).not.toContain('<script>')
      expect(result.tags[1]).toBe('safe-tag')
    })
  })

  describe('containsXSS', () => {
    it('应该检测 script 标签', () => {
      expect(containsXSS('<script>alert(1)</script>')).toBe(true)
    })

    it('应该检测 javascript: 协议', () => {
      expect(containsXSS('javascript:alert(1)')).toBe(true)
    })

    it('应该检测事件处理器', () => {
      expect(containsXSS('onclick=alert(1)')).toBe(true)
      expect(containsXSS('onload=alert(1)')).toBe(true)
    })

    it('应该检测 iframe 标签', () => {
      expect(containsXSS('<iframe src="evil.com">')).toBe(true)
    })

    it('应该对安全内容返回 false', () => {
      expect(containsXSS('Hello World')).toBe(false)
      expect(containsXSS('This is safe text')).toBe(false)
    })
  })

  describe('escapeHtml', () => {
    it('应该转义 & 符号', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('应该转义 < 和 >', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
    })

    it('应该转义引号', () => {
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
      expect(escapeHtml("'single'")).toBe('&#x27;single&#x27;')
    })

    it('应该处理空字符串', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('应该保留普通文本', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World')
    })
  })
})
