# 长运行代理项目

基于 [Anthropic 的长运行代理最佳实践](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) 构建的项目框架。

## 核心理念

### 问题背景
AI 代理在处理复杂任务时面临两大挑战：
1. **上下文窗口限制** - 每个新会话都没有之前的记忆
2. **失败模式** - 试图一次性做太多，或过早宣布完成

### 解决方案：双代理架构

| 代理类型 | 职责 |
|---------|------|
| **初始化代理** | 设置环境、创建功能列表、初始化进度文件 |
| **编码代理** | 每次只做一个功能、增量开发、记录进度 |

## 项目结构

```
.
├── init.sh              # 环境管理脚本
├── claude-progress.txt  # 进度日志
├── feature_list.json    # 功能特性列表
├── .claude/
│   └── agents/
│       ├── initializer.md    # 初始化代理指令
│       └── coding-agent.md   # 编码代理指令
└── README.md
```

## 快速开始

### 1. 初始化项目
```bash
./init.sh setup
```

### 2. 查看项目状态
```bash
./init.sh status
```

### 3. 启动开发服务器
```bash
./init.sh start
```

## 工作流程

### 会话启动检查清单
- [ ] 运行 `pwd` 确认目录
- [ ] 读取 `claude-progress.txt`
- [ ] 读取 `feature_list.json`
- [ ] 检查 `git log --oneline -10`
- [ ] 启动服务并验证基本功能

### 开发原则
1. **增量开发** - 一次只做一个功能
2. **测试驱动** - 只有测试通过才标记功能完成
3. **干净状态** - 每次提交后代码应该可以正常运行
4. **详细记录** - 更新进度文件和 Git 提交

## 功能列表格式

```json
{
  "id": "FEATURE-001",
  "category": "functional",
  "priority": "high",
  "description": "功能描述",
  "steps": [
    "测试步骤 1",
    "测试步骤 2"
  ],
  "acceptance_criteria": [
    "验收标准 1"
  ],
  "passes": false,
  "notes": "备注"
}
```

## 参考资源

- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Claude 4 Prompting Guide](https://docs.anthropic.com/claude/docs/prompting-guide)
