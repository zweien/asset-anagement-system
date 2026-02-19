# 阶段1: 构建前端
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# 阶段2: 构建后端
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# 阶段3: 生产镜像
FROM node:20-alpine
WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 安装生产依赖
COPY server/package*.json ./server/
RUN cd /app/server && npm ci --only=production

# 复制后端构建产物
COPY --from=backend-builder /app/server/dist ./server/dist

# 复制前端构建产物到后端 public 目录
COPY --from=frontend-builder /app/client/dist ./server/public

# 复制 Prisma 相关文件
COPY server/prisma ./server/prisma
RUN cd /app/server && npx prisma generate

# 创建必要的目录
RUN mkdir -p /app/server/uploads /app/server/data /app/server/logs

WORKDIR /app/server
EXPOSE 3002
CMD ["node", "dist/index.js"]
