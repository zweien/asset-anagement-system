# 资产录入管理系统 - 后端服务

## 快速开始

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npm run db:generate

# 同步数据库结构
npm run db:push

# 启动开发服务器
npm run dev
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (热重载) |
| `npm run build` | 编译 TypeScript |
| `npm run start` | 启动生产服务器 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 同步数据库结构 |
| `npm run db:migrate` | 创建数据库迁移 |
| `npm run db:studio` | 打开 Prisma Studio |

## 目录结构

```
server/
├── src/
│   ├── controllers/   # 控制器
│   ├── services/      # 业务逻辑
│   ├── routes/        # 路由定义
│   ├── middleware/    # 中间件
│   ├── utils/         # 工具函数
│   ├── types/         # 类型定义
│   └── index.ts       # 入口文件
├── prisma/
│   └── schema.prisma  # 数据库模型
├── package.json
├── tsconfig.json
└── .env
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
