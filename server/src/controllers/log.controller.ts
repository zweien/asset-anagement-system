import { Request, Response } from 'express'
import { LogService } from '../services/log.service'

export const LogController = {
  // 获取日志列表
  async getAll(req: Request, res: Response) {
    try {
      const { page, pageSize, action, entityType, userId, startDate, endDate } = req.query

      const result = await LogService.getAll({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        action: action as string,
        entityType: entityType as string,
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      })

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取日志失败',
      })
    }
  },

  // 获取单个日志
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await LogService.getById(id)

      if (!result.success) {
        return res.status(404).json(result)
      }

      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取日志失败',
      })
    }
  },

  // 获取统计
  async getStats(req: Request, res: Response) {
    try {
      const result = await LogService.getStats()
      res.json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取统计失败',
      })
    }
  },
}
