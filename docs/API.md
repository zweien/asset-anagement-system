# 资产录入管理系统 - API 文档

## 基础信息

- **Base URL**: `http://localhost:3002/api`
- **认证方式**: 无 (后续支持 JWT)
- **Content-Type**: `application/json`

## 通用响应

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述"
}
```

### 分页响应
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

---

## 1. 健康检查

### GET /health

检查服务状态。

**响应**
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T12:00:00.000Z",
  "uptime": 3600
}
```

---

## 2. 字段配置 API

### GET /fields

获取所有字段配置。

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "serial_number",
      "label": "序列号",
      "type": "TEXT",
      "required": true,
      "options": null,
      "defaultValue": null,
      "validation": "{\"pattern\": \"^[A-Z0-9]+$\"}",
      "order": 1,
      "createdAt": "2026-02-14T12:00:00.000Z",
      "updatedAt": "2026-02-14T12:00:00.000Z"
    }
  ]
}
```

### GET /fields/:id

获取单个字段配置。

### POST /fields

创建字段配置。

**请求体**
```json
{
  "name": "purchase_date",
  "label": "购买日期",
  "type": "DATE",
  "required": false,
  "options": null,
  "defaultValue": null,
  "validation": null
}
```

**字段类型说明**
| 类型 | 说明 | options 格式 |
|------|------|-------------|
| TEXT | 单行文本 | null |
| NUMBER | 数字 | null |
| DATE | 日期 | null |
| SELECT | 下拉单选 | `["选项1", "选项2"]` |
| MULTISELECT | 多选 | `["选项1", "选项2", "选项3"]` |
| TEXTAREA | 多行文本 | null |

### PUT /fields/:id

更新字段配置。

**请求体**
```json
{
  "label": "采购日期",
  "required": true
}
```

### DELETE /fields/:id

删除字段配置。

### PUT /fields/reorder

重新排序字段。

**请求体**
```json
{
  "orders": [
    { "id": "uuid-1", "order": 1 },
    { "id": "uuid-2", "order": 2 }
  ]
}
```

---

## 3. 资产 API

### GET /assets

获取资产列表（分页、筛选、排序）。

**查询参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 (默认 1) |
| pageSize | number | 每页条数 (默认 20) |
| sortBy | string | 排序字段 |
| sortOrder | string | 排序方向 asc/desc |
| search | string | 搜索关键词 |
| category | string | 分类ID |
| status | string | 状态 |
| filter | string | 动态字段筛选 (JSON) |

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "笔记本电脑",
      "code": "IT-001",
      "categoryId": "uuid",
      "status": "ACTIVE",
      "data": {
        "serial_number": "SN123456",
        "purchase_date": "2024-01-15",
        "price": 8000
      },
      "category": {
        "id": "uuid",
        "name": "电子设备"
      },
      "images": [],
      "createdAt": "2026-02-14T12:00:00.000Z",
      "updatedAt": "2026-02-14T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### GET /assets/:id

获取资产详情。

**响应**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "笔记本电脑",
    "code": "IT-001",
    "categoryId": "uuid",
    "status": "ACTIVE",
    "data": {
      "serial_number": "SN123456",
      "purchase_date": "2024-01-15",
      "price": 8000
    },
    "category": {
      "id": "uuid",
      "name": "电子设备"
    },
    "images": [
      {
        "id": "uuid",
        "filename": "abc123.jpg",
        "originalName": "laptop.jpg",
        "mimeType": "image/jpeg",
        "size": 102400,
        "path": "/uploads/abc123.jpg"
      }
    ],
    "createdAt": "2026-02-14T12:00:00.000Z",
    "updatedAt": "2026-02-14T12:00:00.000Z"
  }
}
```

### POST /assets

创建资产。

**请求体**
```json
{
  "name": "笔记本电脑",
  "code": "IT-001",
  "categoryId": "uuid",
  "status": "ACTIVE",
  "data": {
    "serial_number": "SN123456",
    "purchase_date": "2024-01-15",
    "price": 8000
  }
}
```

### PUT /assets/:id

更新资产。

### DELETE /assets/:id

删除资产（软删除）。

### POST /assets/batch-delete

批量删除资产。

**请求体**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

## 4. 分类 API

### GET /categories

获取分类树。

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "电子设备",
      "parentId": null,
      "description": "电子类资产",
      "order": 1,
      "children": [
        {
          "id": "uuid-2",
          "name": "计算机",
          "parentId": "uuid",
          "children": []
        }
      ]
    }
  ]
}
```

### POST /categories

创建分类。

**请求体**
```json
{
  "name": "办公家具",
  "parentId": null,
  "description": "办公用家具",
  "order": 2
}
```

### PUT /categories/:id

更新分类。

### DELETE /categories/:id

删除分类（有子分类或关联资产时禁止删除）。

---

## 5. 导入 API

### POST /import/excel

导入 Excel 文件。

**请求**
- Content-Type: `multipart/form-data`
- 文件字段: `file`

**响应**
```json
{
  "success": true,
  "data": {
    "imported": 100,
    "skipped": 5,
    "errors": [
      {
        "row": 10,
        "error": "序列号重复"
      }
    ]
  }
}
```

### POST /import/database/test

测试数据库连接。

**请求体**
```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "old_assets",
  "username": "root",
  "password": "password"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "tables": ["assets", "categories", "users"]
  }
}
```

### POST /import/database

从数据库导入。

**请求体**
```json
{
  "connection": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "old_assets",
    "username": "root",
    "password": "password"
  },
  "table": "assets",
  "mapping": {
    "name": "asset_name",
    "code": "asset_code",
    "custom_field_1": "field1"
  }
}
```

---

## 6. 导出 API

### GET /export/excel

导出 Excel。

**查询参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| fields | string | 导出字段 (逗号分隔) |
| filter | string | 筛选条件 (JSON) |

**响应**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="assets.xlsx"`

### GET /export/csv

导出 CSV。

### GET /export/images

导出图片 (ZIP)。

---

## 7. 图片 API

### POST /assets/:id/images

上传资产图片。

**请求**
- Content-Type: `multipart/form-data`
- 文件字段: `images` (支持多文件)

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "abc123.jpg",
      "originalName": "photo.jpg",
      "mimeType": "image/jpeg",
      "size": 102400
    }
  ]
}
```

### GET /assets/:id/images

获取资产图片列表。

### DELETE /assets/:id/images/:imageId

删除图片。

---

## 8. 统计 API

### GET /stats/overview

获取总览统计。

**响应**
```json
{
  "success": true,
  "data": {
    "total": 1000,
    "activeCount": 800,
    "idleCount": 100,
    "maintenanceCount": 50,
    "scrappedCount": 50,
    "thisMonthNew": 20
  }
}
```

### GET /stats/by-category

按分类统计。

**响应**
```json
{
  "success": true,
  "data": [
    {
      "categoryId": "uuid",
      "categoryName": "电子设备",
      "count": 500
    }
  ]
}
```

### GET /stats/by-status

按状态统计。

**响应**
```json
{
  "success": true,
  "data": [
    { "status": "ACTIVE", "count": 800 },
    { "status": "IDLE", "count": 100 },
    { "status": "MAINTENANCE", "count": 50 },
    { "status": "SCRAPPED", "count": 50 }
  ]
}
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| VALIDATION_ERROR | 请求参数验证失败 |
| NOT_FOUND | 资源不存在 |
| DUPLICATE_ERROR | 重复数据 |
| FOREIGN_KEY_ERROR | 外键约束失败 |
| FILE_TOO_LARGE | 文件过大 |
| INVALID_FILE_TYPE | 无效文件类型 |
| DATABASE_ERROR | 数据库错误 |
| INTERNAL_ERROR | 服务器内部错误 |

---

*文档版本: 1.0.0*
*最后更新: 2026-02-14*
