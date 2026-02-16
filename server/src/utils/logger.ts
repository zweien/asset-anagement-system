import winston from 'winston'
import path from 'path'

// 日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// 根据环境确定日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'info'
}

// 日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
}

winston.addColors(colors)

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, stack, ...meta } = info
      let log = `${timestamp} [${level.toUpperCase()}]: ${message}`

      // 添加元数据
      if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`
      }

      // 添加堆栈跟踪（仅错误）
      if (stack) {
        log += `\n${stack}`
      }

      return log
    }
  )
)

// 控制台输出格式（带颜色）
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, stack, ...meta } = info
      let log = `${timestamp} [${level}]: ${message}`

      if (Object.keys(meta).length > 0 && meta.service !== undefined) {
        log += ` ${JSON.stringify(meta)}`
      }

      if (stack) {
        log += `\n${stack}`
      }

      return log
    }
  )
)

// 日志目录
const logDir = path.join(process.cwd(), 'logs')

// 创建 Logger 实例
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format,
    }),
  ],
})

// 开发环境额外输出 HTTP 请求日志
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      format,
      maxsize: 5242880,
      maxFiles: 3,
    })
  )
}

export default logger

// 便捷方法
export const logInfo = (message: string, meta?: object) => logger.info(message, meta)
export const logError = (message: string, meta?: object) => logger.error(message, meta)
export const logWarn = (message: string, meta?: object) => logger.warn(message, meta)
export const logDebug = (message: string, meta?: object) => logger.debug(message, meta)
export const logHttp = (message: string, meta?: object) => logger.http(message, meta)
