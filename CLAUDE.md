# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

资产录入管理系统 (Asset Management System) - A full-stack web application for managing assets with dynamic field configuration, Excel import/export, and database migration capabilities.

## Development Workflow

### Session Startup Checklist
```
1. pwd                          # 确认工作目录
2. 读取 claude-progress.txt     # 了解最新进度
3. 读取 feature_list.json       # 查看功能列表
4. git log --oneline -10        # 查看最近提交
5. 启动服务并验证基本功能
```

### Core Principles
| ✅ Must | ⛔ Forbidden |
|--------|-------------|
| 每次只做一个功能 | 一次实现多个功能 |
| 测试通过才标记 passes | 未测试就标记完成 |
| 保持代码库干净状态 | 留下破损代码 |
| 会话结束更新进度文件 | 删除测试用例"解决"失败 |

### Feature Development Cycle
```
选择功能 (passes: false) → 编写代码 → 编写测试 → 运行测试 →
测试通过? → 更新 feature_list.json (passes: true) → Git commit → 更新 claude-progress.txt
```

### Key Files
| 文件 | 用途 |
|------|------|
| `feature_list.json` | 功能清单，记录每个功能的状态和验收标准 |
| `claude-progress.txt` | 进度文件，记录每次会话的工作内容 |
| `.claude/WORKFLOW.md` | 工作流程详细文档 |
| `.claude/agents/coding-agent.md` | 编码代理指令 |

## Common Commands

### Environment Management
```bash
./init.sh setup    # 初始化项目
./init.sh status   # 查看项目状态
./init.sh start    # 启动开发服务器
```

### Backend (server/)
```bash
npm run dev          # Development server with hot reload (port 3002)
npm run build        # TypeScript compilation
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio GUI
```

### Frontend (client/)
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
```

## Architecture

### Backend Structure
- **Controllers** (`src/controllers/`): HTTP request handling, validation
- **Services** (`src/services/`): Business logic, database operations
- **Routes** (`src/routes/`): API endpoint definitions
- **Prisma** (`prisma/`): Database schema and ORM

### Frontend Structure
- **Pages** (`src/pages/`): Route-level components
- **Components** (`src/components/`): Reusable UI components
- **Lib** (`src/lib/`): API client, utilities, type definitions

### Database Schema
- **Asset**: Main entity with dynamic `data` JSON field for custom fields
- **FieldConfig**: Dynamic field definitions (TEXT, NUMBER, DATE, SELECT, MULTISELECT)
- **Category**: Hierarchical categories with parentId
- **AssetImage**: Image attachments linked to assets
- **OperationLog**: Audit trail with old/new value tracking
- **User**: Authentication with role-based access

## Key Patterns

### API Response Format
```typescript
{ success: boolean, data?: T, error?: string, message?: string }
```

### Asset Filtering
Assets support dynamic field filtering via the `filters` query parameter:
```typescript
filters: JSON.stringify({ fieldName: { operator: "contains", value: "search" } })
```
Operators: contains, equals, startsWith, endsWith, isEmpty, isNotEmpty, gt, gte, lt, lte, between

### Dynamic Fields
Field values are stored in `Asset.data` as JSON. Base columns (name, code, status, categoryId, createdAt) are filtered at database level; dynamic fields are filtered in application layer due to SQLite JSON limitations.

## Testing

### Frontend Testing (chrome-devtools MCP)
```
new_page(url) → take_snapshot → click/fill → take_screenshot → list_console_messages
```

### Backend API Testing
```bash
curl http://localhost:3002/api/health           # Health check
curl http://localhost:3002/api/assets           # List assets
curl http://localhost:3002/api/fields           # List field configs
```

## Development Notes

### Ports
| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (Express) | 3002 |

### Configuration
- SQLite database file: `data/assets.db`
- Upload directory: `uploads/`
- Authentication: JWT stored in localStorage
- All deletions are soft deletes (deletedAt timestamp)

### Default Login
- Username: `admin`
- Password: `admin123`

### TailwindCSS v4
使用 `@import "tailwindcss"` 替代 `@tailwind` 指令，使用 `@theme` 块定义自定义颜色，使用 `@variant dark` 启用深色模式。

## Feature Categories
- **infrastructure**: 核心基础设施 (CORE-xxx)
- **functional**: 业务功能 (ASSET-xxx, IMPORT-xxx, EXPORT-xxx, IMAGE-xxx, VIZ-xxx, AUTH-xxx, LOG-xxx)
- **ui**: 界面优化 (UI-xxx)
