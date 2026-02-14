# 资产录入管理系统 - 架构图

## 1. 系统架构图

```mermaid
flowchart TB
    subgraph Client["客户端 (Browser)"]
        UI[React + TailwindCSS]
        Router[React Router]
        Table[TanStack Table]
        HTTP[Axios]
    end

    subgraph Server["后端服务 (Node.js)"]
        Express[Express Server]
        Controller[Controllers]
        Service[Services]
        Prisma[Prisma ORM]
    end

    subgraph Storage["数据存储"]
        DB[(SQLite)]
        Files[本地文件存储]
        ExtDB[(外部数据库)]
    end

    UI --> Router
    Router --> Table
    UI --> HTTP
    HTTP -->|REST API| Express
    Express --> Controller
    Controller --> Service
    Service --> Prisma
    Prisma --> DB
    Service --> Files
    Service -->|导入| ExtDB
```

## 2. 数据库 ER 图

```mermaid
erDiagram
    FieldConfig {
        string id PK
        string name
        string label
        string type
        boolean required
        string options
        string defaultValue
        string validation
        int order
        datetime createdAt
        datetime updatedAt
    }

    Category {
        string id PK
        string name
        string parentId FK
        string description
        int order
        datetime createdAt
        datetime updatedAt
    }

    Asset {
        string id PK
        string name
        string code UK
        string categoryId FK
        string status
        string data
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    AssetImage {
        string id PK
        string assetId FK
        string filename
        string originalName
        string mimeType
        int size
        string path
        datetime createdAt
    }

    OperationLog {
        string id PK
        string action
        string entityType
        string entityId
        string userId
        string userName
        string oldValue
        string newValue
        string ip
        string userAgent
        datetime createdAt
    }

    User {
        string id PK
        string username UK
        string password
        string name
        string email UK
        string role
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    Category ||--o{ Category : "父子关系"
    Category ||--o{ Asset : "包含"
    Asset ||--o{ AssetImage : "拥有"
    User ||--o{ OperationLog : "产生"
```

## 3. API 请求流程图

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant Ctrl as Controller
    participant Svc as Service
    participant P as Prisma
    participant DB as SQLite

    C->>R: HTTP Request
    R->>Ctrl: Route to Controller
    Ctrl->>Ctrl: Validate Request
    Ctrl->>Svc: Call Service
    Svc->>P: Prisma Query
    P->>DB: SQL Query
    DB-->>P: Result
    P-->>Svc: Data
    Svc-->>Ctrl: Response Data
    Ctrl-->>R: JSON Response
    R-->>C: HTTP Response
```

## 4. 前端组件结构图

```mermaid
flowchart TB
    subgraph App["App"]
        Router[BrowserRouter]
    end

    subgraph Layout["Layout"]
        Header[Header]
        Main[Main Content]
    end

    subgraph Pages["Pages"]
        Dashboard[Dashboard]
        Assets[Assets]
        Import[Import]
        Export[Export]
        Reports[Reports]
        Settings[Settings]
    end

    subgraph Components["Components"]
        UITable[Table]
        Forms[Forms]
        Modals[Modals]
        Buttons[Buttons]
    end

    App --> Router
    Router --> Layout
    Layout --> Header
    Layout --> Pages
    Pages --> Components
```

## 5. 后端分层架构图

```mermaid
flowchart LR
    subgraph Routes["Routes 层"]
        R1[/fields]
        R2[/assets]
        R3[/categories]
        R4[/import]
        R5[/export]
    end

    subgraph Controllers["Controllers 层"]
        C1[FieldController]
        C2[AssetController]
        C3[CategoryController]
        C4[ImportController]
        C5[ExportController]
    end

    subgraph Services["Services 层"]
        S1[FieldService]
        S2[AssetService]
        S3[CategoryService]
        S4[ImportService]
        S5[ExportService]
    end

    subgraph Data["Data 层"]
        Prisma[Prisma Client]
    end

    R1 --> C1 --> S1
    R2 --> C2 --> S2
    R3 --> C3 --> S3
    R4 --> C4 --> S4
    R5 --> C5 --> S5

    S1 --> Prisma
    S2 --> Prisma
    S3 --> Prisma
    S4 --> Prisma
    S5 --> Prisma
```

## 6. 数据导入流程图

```mermaid
flowchart TB
    Start([开始导入])

    subgraph Excel["Excel 导入"]
        E1[上传文件]
        E2[解析 Excel]
        E3[字段映射]
        E4[数据验证]
        E5[批量插入]
    end

    subgraph DB["数据库导入"]
        D1[配置连接]
        D2[测试连接]
        D3[选择表]
        D4[字段映射]
        D5[数据预览]
        D6[批量导入]
    end

    End([导入完成])

    Start --> E1 --> E2 --> E3 --> E4 --> E5 --> End
    Start --> D1 --> D2 --> D3 --> D4 --> D5 --> D6 --> End

    E4 -->|验证失败| E3
    D2 -->|连接失败| D1
```

## 7. 资产生命周期状态图

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: 创建资产
    ACTIVE --> IDLE: 停用
    ACTIVE --> MAINTENANCE: 送修
    IDLE --> ACTIVE: 启用
    IDLE --> MAINTENANCE: 送修
    MAINTENANCE --> ACTIVE: 修复
    MAINTENANCE --> SCRAPPED: 无法修复
    SCRAPPED --> [*]
```

## 8. 部署架构图

```mermaid
flowchart TB
    subgraph Production["生产环境"]
        Nginx[Nginx 反向代理:80/443]

        subgraph Services["服务"]
            FE[前端静态文件]
            BE[Node.js :3000]
        end

        subgraph Data["数据"]
            SQLite[(SQLite)]
            Uploads[uploads/]
        end
    end

    Client[用户浏览器] -->|HTTPS| Nginx
    Nginx -->|/| FE
    Nginx -->|/api/*| BE
    BE --> SQLite
    BE --> Uploads
```

## 9. 功能模块关系图

```mermaid
mindmap
  root((资产管理系统))
    基础架构
      后端服务
      前端应用
      数据库
    资产管理
      资产列表
      新增/编辑
      删除
      详情查看
    字段配置
      字段类型
      验证规则
      排序
    数据导入
      Excel导入
      数据库导入
      字段映射
    数据导出
      Excel导出
      CSV导出
      图片导出
    图片管理
      拍照上传
      图片预览
      批量管理
    统计分析
      分类统计
      状态统计
      自定义报表
    系统设置
      用户管理
      权限配置
      操作日志
```

---

*使用 Mermaid 语法渲染*
