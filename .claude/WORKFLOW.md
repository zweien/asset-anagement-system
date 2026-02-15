# 长运行代理 - 工作流程指南

## 概述

本文档描述了如何在项目中使用长运行代理框架进行开发。

## 代理类型

### 1. 初始化代理 (Initializer Agent)
- **触发时机**: 项目首次创建或重大重构时
- **指令文件**: `.claude/agents/initializer.md`
- **主要任务**:
  - 设置项目环境
  - 创建详细的功能列表
  - 初始化进度文件
  - 创建初始 Git 提交

### 2. 编码代理 (Coding Agent)
- **触发时机**: 每个开发会话
- **指令文件**: `.claude/agents/coding-agent.md`
- **主要任务**:
  - 读取进度文件了解上下文
  - 选择下一个待开发功能
  - 实现功能并测试
  - 更新进度文件和提交代码

## 会话工作流

```
┌─────────────────────────────────────────────────────────────┐
│                      会话开始                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 获取上下文                                               │
│     - pwd                                                   │
│     - 读取 claude-progress.txt                              │
│     - 读取 feature_list.json                                │
│     - git log --oneline -10                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 验证环境                                                 │
│     - ./init.sh status                                      │
│     - 启动开发服务器                                         │
│     - 验证基本功能正常                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 选择下一个功能                                           │
│     - 从 feature_list.json 选择                              │
│     - 优先级最高且 passes: false                             │
│     - 一次只选一个                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 开发与测试                                               │
│     - 编写代码                                               │
│     - 编写测试                                               │
│     - 运行测试验证                                           │
│     - 端到端测试 (如适用)                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 更新记录                                                 │
│     - 更新 claude-progress.txt                               │
│     - 更新 feature_list.json (如果测试通过)                  │
│     - Git commit                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      会话结束                                │
└─────────────────────────────────────────────────────────────┘
```

## 功能列表管理

### 添加新功能
```json
{
  "id": "FEATURE-002",
  "category": "functional",
  "priority": "medium",
  "description": "用户可以点击按钮提交表单",
  "steps": [
    "打开表单页面",
    "填写必填字段",
    "点击提交按钮",
    "验证提交成功"
  ],
  "acceptance_criteria": [
    "表单验证正常工作",
    "提交后显示成功消息"
  ],
  "passes": false
}
```

### 标记功能完成
**只有当所有测试通过时**，将 `passes` 设为 `true`：
```json
{
  "id": "FEATURE-002",
  "passes": true
}
```

## 进度文件格式

```markdown
## 2026-02-14 - 会话 3

### 完成的工作
- [x] FEATURE-002: 用户表单提交功能
- [x] 添加表单验证测试

### 当前状态
- 进度: 5/20 功能通过 (25%)
- 正在开发: FEATURE-003

### 遇到的问题
- 无

### 下一步
- [ ] 实现 FEATURE-003: 用户登录功能

---
```

## 测试流程

### 前端测试 (使用 chrome-devtools MCP)

**工作流程:**
```
1. 启动前端服务
   npm run dev (后台运行)

2. 打开浏览器页面
   mcp__chrome-devtools__new_page url="http://localhost:5173"

3. 截取页面快照
   mcp__chrome-devtools__take_snapshot  # 获取元素 uid

4. 交互测试
   mcp__chrome-devtools__click uid="xxx"      # 点击
   mcp__chrome-devtools__fill uid="xxx" value # 填写

5. 视觉验证
   mcp__chrome-devtools__take_screenshot  # 截图确认

6. 响应式测试
   mcp__chrome-devtools__resize_page width=375 height=667
```

**测试清单:**
- [ ] 页面正常加载 (无白屏/报错)
- [ ] 导航功能正常
- [ ] 主题切换正常 (检查 html class 变化)
- [ ] 表单交互正常
- [ ] 移动端响应式布局正常
- [ ] 控制台无错误

### 后端 API 测试

**使用 curl 测试:**
```bash
# 健康检查
curl http://localhost:3002/api/health

# GET 请求
curl http://localhost:3002/api/fields

# POST 请求
curl -X POST http://localhost:3002/api/fields \
  -H "Content-Type: application/json" \
  -d '{"name":"test","label":"测试","type":"TEXT"}'

# PUT 请求
curl -X PUT http://localhost:3002/api/fields/:id \
  -H "Content-Type: application/json" \
  -d '{"label":"新标签"}'

# DELETE 请求
curl -X DELETE http://localhost:3002/api/fields/:id
```

### Playwright 自动化测试

**适用于: 复杂交互、回归测试**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')

    # 测试交互
    page.get_by_role('button', name='切换主题').click()
    page.wait_for_timeout(500)

    # 验证结果
    html_class = page.get_attribute('html', 'class') or ''
    assert 'dark' in html_class, "主题切换失败"

    browser.close()
```

## 技术经验记录

### TailwindCSS v4 配置

**问题:** TailwindCSS v4 使用全新的配置方式，旧版 tailwind.config.js 不再使用。

**解决方案:**
```css
/* client/src/index.css */
@import "tailwindcss";

/* 自定义主题颜色 */
@theme {
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
}

/* 启用深色模式 (基于 class) */
@variant dark (&:where(.dark, .dark *));
```

**关键点:**
- 使用 `@import "tailwindcss"` 替代 `@tailwind` 指令
- 使用 `@theme` 块定义自定义颜色
- 使用 `@variant dark` 启用深色模式
- 删除旧的 `tailwind.config.js` 文件

### 端口配置

| 服务 | 端口 | 配置文件 |
|------|------|----------|
| 前端 (Vite) | 5173 | 自动 |
| 后端 (Express) | 3002 | `server/.env` |

### 常见问题

#### Q: 发现之前的功能有 bug 怎么办？
A: 优先修复 bug，单独提交修复，然后在进度文件中记录。

#### Q: 功能太复杂无法在一个会话完成？
A: 将功能拆分为更小的子功能，更新 feature_list.json。

#### Q: 测试一直无法通过？
A: 不要将功能标记为 passes，在进度文件中记录问题，提交当前进度并标注"未完成"。

#### Q: 前端页面显示异常？
A: 检查步骤:
1. 检查控制台错误 (`list_console_messages`)
2. 检查服务是否正常启动
3. 检查 CSS/JS 是否正确加载
4. 检查 TailwindCSS 配置是否正确

#### Q: 主题切换不生效？
A: 检查步骤:
1. 确认 `@variant dark` 已配置
2. 确认 `useTheme` hook 正确添加/移除 `dark` class
3. 使用 chrome-devtools 检查 html 元素的 class 变化
