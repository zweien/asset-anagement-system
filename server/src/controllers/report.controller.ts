import { Request, Response } from 'express'
import { ReportService, CreateReportTemplateDto, UpdateReportTemplateDto } from '../services/report.service'

export const ReportController = {
  // 获取所有报表模板
  async getTemplates(req: Request, res: Response) {
    try {
      const templates = await ReportService.getAllTemplates()
      res.json({ success: true, data: templates })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取报表模板失败',
      })
    }
  },

  // 获取单个报表模板
  async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params
      const template = await ReportService.getTemplateById(id)

      if (!template) {
        return res.status(404).json({ success: false, error: '报表模板不存在' })
      }

      res.json({ success: true, data: template })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取报表模板失败',
      })
    }
  },

  // 创建报表模板
  async createTemplate(req: Request, res: Response) {
    try {
      const data = req.body as CreateReportTemplateDto

      if (!data.name || !data.chartType || !data.dimension) {
        return res.status(400).json({
          success: false,
          error: '请填写报表名称、图表类型和数据维度',
        })
      }

      const template = await ReportService.createTemplate(data)
      res.json({ success: true, data: template, message: '报表模板创建成功' })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '创建报表模板失败',
      })
    }
  },

  // 更新报表模板
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body as UpdateReportTemplateDto

      const template = await ReportService.updateTemplate(id, data)
      res.json({ success: true, data: template, message: '报表模板更新成功' })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '更新报表模板失败',
      })
    }
  },

  // 删除报表模板
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params
      await ReportService.deleteTemplate(id)
      res.json({ success: true, message: '报表模板删除成功' })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '删除报表模板失败',
      })
    }
  },

  // 获取报表数据
  async getReportData(req: Request, res: Response) {
    try {
      const { dimension, chartType, filters, dateRange, customStartDate, customEndDate } = req.query

      if (!dimension) {
        return res.status(400).json({ success: false, error: '请指定数据维度' })
      }

      const data = await ReportService.getReportData(
        dimension as string,
        (chartType as string) || 'bar',
        filters as string,
        dateRange as string,
        customStartDate as string,
        customEndDate as string
      )

      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取报表数据失败',
      })
    }
  },
}
