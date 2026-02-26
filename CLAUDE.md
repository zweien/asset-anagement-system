# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

资产录入管理系统 (Asset Management System) v1.3.0 - A full-stack web application for managing assets with:
- Dynamic field configuration (TEXT, NUMBER, DATE, SELECT, MULTISELECT)
- Excel import/export with template support
- Image attachment management
- Hierarchical category system
- AI-powered assistant with multiple LLM support
- User management with role-based access control
- Operation logging and audit trail
- Database backup and SQL query tools
- Data visualization (charts and statistics)

## Development Workflow

### Session Startup Checklist
```
1. pwd                          # 确认工作目录
2. 读取 claude-progress.txt     # 了解最新进度
3. 读取 feature_list.json       # 查看功能列表
4. git log --oneline -10        # 查看最近提交
5. 启动服务并验证基本功能
```

### Agent Workflow (六步工作流)

#### Step 1: 初始化环境
```bash
./init.sh setup && ./init.sh server
```

#### Step 2: 选择下一个任务
读取 `feature_list.json`，选择 `passes: false` 的任务

#### Step 3: 实现功能
- 阅读任务描述和验收标准
- 遵循现有代码模式和约定

#### Step 4: 测试验证
（见下方强制测试要求）

#### Step 5: 更新进度
更新 `claude-progress.txt` 记录工作内容

#### Step 6: 提交变更
同时更新 `feature_list.json` 并 `git commit`

### Core Principles
| ✅ Must | ⛔ Forbidden |
|--------|-------------|
| 每次只做一个功能 | 一次实现多个功能 |
| 测试通过才标记 passes | 未测试就标记完成 |
| 保持代码库干净状态 | 留下破损代码 |
| 会话结束更新进度文件 | 删除测试用例"解决"失败 |
| UI 修改必须浏览器测试 | 提交未经浏览器验证的 UI |
| 阻塞时停止并请求帮助 | 假装任务已完成 |

### 强制测试要求 (MANDATORY)

1. **大幅度页面修改**（新建页面、重写组件、修改核心交互）：
   - **必须在浏览器中测试！** 使用 chrome-devtools MCP 或 Playwright
   - 验证页面能正确加载和渲染
   - 验证表单提交、按钮点击等交互功能
   - 截图确认 UI 正确显示

2. **小幅度代码修改**（修复 bug、调整样式、添加辅助函数）：
   - 可以使用单元测试或 lint/build 验证
   - 如有疑虑，仍建议浏览器测试

3. **所有修改必须通过**：
   - `./init.sh lint` 无错误
   - `./init.sh build` 构建成功
   - 功能在浏览器中正常工作（对于 UI 相关修改）

### 测试清单
- [ ] 代码没有 TypeScript 错误
- [ ] lint 通过
- [ ] build 成功
- [ ] 功能在浏览器中正常工作（对于 UI 相关修改）

### 阻塞处理 (Blocking Issues)

#### 需要停止任务并请求人工帮助的情况：

1. **缺少环境配置**：
   - .env 需要填写真实的 API 密钥
   - 外部服务需要开通账号

2. **外部依赖不可用**：
   - 第三方 API 服务宕机
   - 需要人工授权的 OAuth 流程

3. **测试无法进行**：
   - 功能依赖外部系统尚未部署
   - 需要特定硬件环境

#### 阻塞时的正确操作

**DO NOT（禁止）**：
- ❌ 提交 git commit
- ❌ 将 `feature_list.json` 的 `passes` 设为 `true`
- ❌ 假装任务已完成

**DO（必须）**：
- ✅ 在 `claude-progress.txt` 中记录当前进度和阻塞原因
- ✅ 输出清晰的阻塞信息，说明需要人工做什么
- ✅ 停止任务，等待人工介入

#### 阻塞信息格式

```
🚫 任务阻塞 - 需要人工介入

**当前任务**: [任务名称]
**已完成的工作**: [已完成的代码/配置]
**阻塞原因**: [具体说明为什么无法继续]
**需要人工帮助**:
1. [具体的步骤 1]
2. [具体的步骤 2]
```

### Common Development Scenarios
```bash
# 数据库变更
./init.sh db:push              # 推送 schema 变更
./init.sh db:studio            # 打开 Prisma Studio 查看数据
./init.sh db:reset             # 重置数据库（开发环境）

# 代码质量
./init.sh lint                 # 运行代码检查
./init.sh build                # 构建生产版本

# 测试
./init.sh test                 # 运行后端单元测试
./init.sh e2e                  # 运行 E2E 测试
```

### Key Files
| 文件 | 用途 |
|------|------|
| `feature_list.json` | 功能清单，记录每个功能的状态和验收标准 |
| `claude-progress.txt` | 进度文件，记录每次会话的工作内容 |

### 进度文件格式 (claude-progress.txt)

```markdown
## YYYY-MM-DD - 会话 N

### 完成的工作
- [x] FEATURE-XXX: 功能描述
- [x] 其他更改

### 当前状态
- 进度: X/Y 功能通过 (百分比%)
- 正在开发: 下一个功能 ID

### 遇到的问题
- [如果有问题，记录下来]

### 下一步
- [ ] 下一个任务

---
```

## Common Commands

### Environment Management (init.sh)
```bash
./init.sh setup      # 初始化项目（安装依赖）
./init.sh status     # 查看项目状态
./init.sh server     # 启动后端服务 (port 3002)
./init.sh client     # 启动前端服务 (port 5173)
```

### Database Operations
```bash
./init.sh db:push    # 推送 schema 变更到数据库
./init.sh db:studio  # 打开 Prisma Studio GUI
./init.sh db:reset   # 重置数据库（删除所有数据）
```

### Build & Quality
```bash
./init.sh build      # 构建前后端生产版本
./init.sh lint       # 运行代码检查
```

### Testing
```bash
./init.sh test       # 运行后端单元测试
./init.sh e2e        # 运行 E2E 测试 (Playwright)
./init.sh e2e:ui     # 带 UI 的 E2E 测试
```

### Backend (server/)
```bash
npm run dev          # Development server with hot reload (port 3002)
npm run build        # TypeScript compilation
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio GUI
npm run test         # Run unit tests
npm run lint         # Run ESLint
```

### Frontend (client/)
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm run lint         # Run ESLint
```

## Environment Variables

### Backend (server/.env)
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `3002` |
| `DATABASE_URL` | 数据库连接 | `file:../data/assets.db` |
| `JWT_SECRET` | JWT 密钥 | (required) |
| `UPLOAD_DIR` | 上传目录 | `uploads` |
| `MAX_FILE_SIZE` | 最大文件大小 (bytes) | `10485760` (10MB) |

### AI Configuration (可选)
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEEPSEEK_API_KEY` | AI API 密钥 | - |
| `DEEPSEEK_BASE_URL` | AI API 地址 | `https://api.deepseek.com` |
| `AI_MODEL` | 模型名称 | `deepseek-chat` |
| `AI_MAX_TOKENS` | 最大 Token | `4096` |

> AI 配置也可以在前端设置页面配置，前端配置优先级更高。

## Architecture

### Backend Structure
- **Controllers** (`src/controllers/`): HTTP request handling, validation
- **Services** (`src/services/`): Business logic, database operations
- **Routes** (`src/routes/`): API endpoint definitions
- **Middlewares** (`src/middlewares/`): Auth, error handling, logging
- **Prisma** (`prisma/`): Database schema and ORM

### Frontend Structure
- **Pages** (`src/pages/`): Route-level components
- **Components** (`src/components/`): Reusable UI components (shadcn/ui based)
- **Lib** (`src/lib/`): API client, utilities, type definitions
- **Stores** (`src/stores/`): Zustand state management
- **Hooks** (`src/hooks/`): Custom React hooks

### Database Schema
- **Asset**: Main entity with dynamic `data` JSON field for custom fields
- **FieldConfig**: Dynamic field definitions (TEXT, NUMBER, DATE, SELECT, MULTISELECT)
- **Category**: Hierarchical categories with parentId
- **AssetImage**: Image attachments linked to assets
- **OperationLog**: Audit trail with old/new value tracking
- **User**: Authentication with role-based access
- **SystemConfig**: System-wide configuration (AI settings, etc.)

### Tech Stack
**Frontend**: React 19, Vite, TailwindCSS v4, shadcn/ui, Zustand, Recharts, React Router v7

**Backend**: Express, Prisma, SQLite, Winston (logging), zod (validation), xlsx (Excel), bcrypt, JWT

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | 用户登录 | - |
| POST | `/logout` | 用户登出 | - |
| GET | `/me` | 获取当前用户 | Required |

### Assets (`/api/assets`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | 获取资产列表（支持过滤） | Required |
| GET | `/:id` | 获取单个资产 | Required |
| POST | `/` | 创建资产 | Editor+ |
| PUT | `/:id` | 更新资产 | Editor+ |
| DELETE | `/:id` | 删除资产（软删除） | Editor+ |
| GET | `/:id/history` | 获取资产变更历史 | Required |

### Field Configs (`/api/fields`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | 获取字段配置列表 | Required |
| GET | `/:id` | 获取单个字段配置 | Required |
| POST | `/` | 创建字段配置 | Editor+ |
| PUT | `/:id` | 更新字段配置 | Editor+ |
| DELETE | `/:id` | 删除字段配置 | Editor+ |
| POST | `/reorder` | 重新排序字段 | Editor+ |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | 获取分类树 | Required |
| POST | `/` | 创建分类 | Editor+ |
| PUT | `/:id` | 更新分类 | Editor+ |
| DELETE | `/:id` | 删除分类 | Editor+ |

### Import/Export
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/import` | 导入 Excel 文件 | Editor+ |
| GET | `/api/import/template` | 下载导入模板 | Required |
| GET | `/api/export` | 导出资产到 Excel | Required |

### Images (`/api/images`, `/api/assets/:id/images`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/images/upload` | 上传图片 | Editor+ |
| GET | `/api/images/:filename` | 获取图片 | - |
| GET | `/api/assets/:id/images` | 获取资产的图片列表 | Required |
| DELETE | `/api/assets/:assetId/images/:imageId` | 删除图片 | Editor+ |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | 获取用户列表 | Admin |
| GET | `/:id` | 获取单个用户 | Admin |
| POST | `/` | 创建用户 | Admin |
| PUT | `/:id` | 更新用户 | Admin |
| DELETE | `/:id` | 删除用户 | Admin |
| POST | `/batch-import` | 批量导入用户 | Admin |

### Operation Logs (`/api/logs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | 获取操作日志 | Admin |
| GET | `/stats` | 获取日志统计 | Admin |

### Backup (`/api/backup`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | 下载数据库备份 | Admin |
| POST | `/restore` | 恢复数据库 | Admin |

### System Config (`/api/system-config`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | 获取系统配置 | Admin |
| PUT | `/` | 更新系统配置 | Admin |

### SQL Query (`/api/sql-query`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | 执行 SQL 查询 | Admin |

### AI Assistant (`/api/ai`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/chat` | AI 对话 | Required |
| GET | `/stream` | AI 流式对话 (SSE) | Required |

## User Roles & Permissions

| 角色 | 权限说明 |
|------|----------|
| **Admin** | 完全访问权限：用户管理、系统配置、SQL 查询、数据库备份/恢复、所有 Editor 权限 |
| **Editor** | 资产增删改查、导入导出、图片管理、字段配置、分类管理 |
| **User** | 只读访问：查看资产列表和详情、查看分类、使用 AI 助手 |

## AI Assistant

### Supported LLM Providers
- DeepSeek (default)
- OpenAI
- Moonshot
- Custom OpenAI-compatible APIs

### Configuration Methods
1. **Frontend Settings** (推荐): 设置 → AI 配置页面
2. **Environment Variables**: 服务端 `.env` 文件

前端配置优先级高于环境变量。

### API Types
- **Chat Completions API**: 标准 OpenAI 格式 (`/v1/chat/completions`)
- **Responses API**: OpenAI 新格式 (`/v1/responses`)

### Rate Limiting
- 默认限制：20 次/分钟
- 可在系统配置中调整

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

### Backend Unit Tests
```bash
cd server
npm run test           # 运行所有测试
npm run test:watch     # 监视模式
npm run test:coverage  # 覆盖率报告
```

### E2E Tests (Playwright)
```bash
./init.sh e2e          # 运行 E2E 测试
./init.sh e2e:ui       # 带 UI 的 E2E 测试

# 或直接使用
npx playwright test
npx playwright test --ui
```

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
| Prisma Studio | 5555 |

### Configuration
- SQLite database file: `data/assets.db`
- Upload directory: `uploads/`
- Logs directory: `logs/`
- Authentication: JWT stored in localStorage
- All deletions are soft deletes (deletedAt timestamp)

### Default Login
- Username: `admin`
- Password: `admin123`

### TailwindCSS v4
使用 `@import "tailwindcss"` 替代 `@tailwind` 指令，使用 `@theme` 块定义自定义颜色，使用 `@variant dark` 启用深色模式。

## Troubleshooting

### 常见问题

**数据库锁定错误**
```bash
# 停止所有服务后重试
pkill -f "node.*server"
./init.sh db:push
```

**前端缓存问题**
```bash
rm -rf client/node_modules/.vite
./init.sh client
```

**依赖安装失败**
```bash
rm -rf node_modules server/node_modules client/node_modules
rm -f package-lock.json server/package-lock.json client/package-lock.json
./init.sh setup
```

**端口被占用**
```bash
# 查找占用端口的进程
lsof -i :3002  # 后端
lsof -i :5173  # 前端
```

## Feature Categories
- **infrastructure**: 核心基础设施 (CORE-xxx)
- **functional**: 业务功能 (ASSET-xxx, IMPORT-xxx, EXPORT-xxx, IMAGE-xxx, VIZ-xxx, AUTH-xxx, LOG-xxx, AI-xxx, USER-xxx, BACKUP-xxx)
- **ui**: 界面优化 (UI-xxx)

## Key Rules

1. **每次只做一个功能** - 专注于完成好一个任务
2. **测试通过才标记完成** - 所有步骤必须通过验证
3. **UI 修改必须浏览器测试** - 新建或大幅修改页面必须在浏览器测试
4. **会话结束更新进度文件** - 帮助后续会话理解工作内容
5. **一次提交包含所有更改** - 代码、progress、feature_list 在同一个 commit
6. **永远不要移除任务** - 只能将 `passes: false` 改为 `true`
7. **阻塞时停止** - 需要人工介入时，不要提交，输出阻塞信息并停止
8. **Git Tag 版本发布** - 更新 tag 时必须同步更新：
   - `CLAUDE.md` 中的版本号
   - `server/package.json` 和 `client/package.json` 中的版本号
   - `README.md`（中文）
   - `README_EN.md`（英文）
