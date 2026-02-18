import { Request, Response } from 'express'
import { SqlQueryService } from '../services/sql-query.service'

// 执行 SQL 查询
export const executeQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sql } = req.body

    if (!sql || typeof sql !== 'string') {
      res.status(400).json({
        success: false,
        error: '请提供有效的 SQL 查询语句',
      })
      return
    }

    // 去除首尾空白
    const trimmedSql = sql.trim()

    if (trimmedSql.length === 0) {
      res.status(400).json({
        success: false,
        error: 'SQL 查询语句不能为空',
      })
      return
    }

    // 限制 SQL 长度
    if (trimmedSql.length > 5000) {
      res.status(400).json({
        success: false,
        error: 'SQL 查询语句过长，最大允许 5000 个字符',
      })
      return
    }

    const result = await SqlQueryService.executeQuery(trimmedSql)

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        rowCount: result.rowCount,
        columns: result.columns,
        executionTime: result.executionTime,
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error) {
    console.error('SQL 查询控制器错误:', error)
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    })
  }
}

// 获取允许查询的表
export const getAllowedTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = SqlQueryService.getAllowedTables()
    res.json({
      success: true,
      data: tables,
    })
  } catch (error) {
    console.error('获取允许的表列表错误:', error)
    res.status(500).json({
      success: false,
      error: '获取表列表失败',
    })
  }
}

// 获取表结构
export const getTableSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableName } = req.params

    if (!tableName) {
      res.status(400).json({
        success: false,
        error: '请提供表名',
      })
      return
    }

    const result = await SqlQueryService.getTableSchema(tableName)

    if (result.success) {
      res.json({
        success: true,
        data: result.columns,
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error) {
    console.error('获取表结构错误:', error)
    res.status(500).json({
      success: false,
      error: '获取表结构失败',
    })
  }
}
