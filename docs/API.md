# API Documentation

Interactive API documentation is available via Swagger UI at: `http://localhost:3002/api/docs`

## Base Information

| Item | Value |
|------|-------|
| **Base URL** | `http://localhost:3002/api` |
| **Authentication** | JWT Bearer Token |
| **Content-Type** | `application/json` |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Obtain a token via the `/auth/login` endpoint.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

---

## Authentication Endpoints

### POST /auth/login

Login and obtain JWT token.

**Request Body**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "name": "Administrator",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /auth/register

Register a new user.

**Request Body**
```json
{
  "username": "newuser",
  "password": "Password123",
  "name": "New User",
  "email": "user@example.com"
}
```

### POST /auth/change-password

Change current user's password.

**Headers**: `Authorization: Bearer <token>`

**Request Body**
```json
{
  "oldPassword": "currentPassword",
  "newPassword": "newPassword123"
}
```

---

## Field Configuration Endpoints

### GET /fields

Get all field configurations.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "serial_number",
      "label": "Serial Number",
      "type": "TEXT",
      "required": true,
      "visible": true,
      "options": null,
      "order": 1,
      "createdAt": "2025-02-14T12:00:00.000Z"
    }
  ]
}
```

### POST /fields

Create a new field configuration.

**Request Body**
```json
{
  "name": "purchase_date",
  "label": "Purchase Date",
  "type": "DATE",
  "required": false,
  "visible": true
}
```

**Field Types**

| Type | Description | Options Format |
|------|-------------|----------------|
| TEXT | Single-line text | null |
| TEXTAREA | Multi-line text | null |
| NUMBER | Numeric value | null |
| DATE | Date picker | null |
| SELECT | Dropdown (single) | "Option1\nOption2\nOption3" |
| MULTISELECT | Multiple selection | "Option1\nOption2\nOption3" |

### PUT /fields/:id

Update field configuration.

### DELETE /fields/:id

Delete field configuration (custom fields only).

---

## Asset Endpoints

### GET /assets

Get paginated list of assets with filtering and sorting.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Items per page (default: 20) |
| sortBy | string | Sort field |
| sortOrder | string | Sort direction: `asc` or `desc` |
| search | string | Search keyword |
| status | string | Filter by status |
| categoryId | string | Filter by category |
| filters | string | Dynamic field filters (JSON string) |

**Filter Format**
```json
{
  "fieldName": {
    "operator": "contains",
    "value": "search term"
  }
}
```

**Available Operators**

| Operator | Description | Field Types |
|----------|-------------|-------------|
| contains | Contains substring | TEXT, TEXTAREA |
| notContains | Does not contain | TEXT, TEXTAREA |
| equals | Exact match | All |
| notEquals | Not equal | All |
| startsWith | Starts with | TEXT |
| endsWith | Ends with | TEXT |
| isEmpty | Is empty/null | All |
| isNotEmpty | Is not empty | All |
| gt | Greater than | NUMBER, DATE |
| gte | Greater than or equal | NUMBER, DATE |
| lt | Less than | NUMBER, DATE |
| lte | Less than or equal | NUMBER, DATE |
| between | In range | NUMBER, DATE |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Laptop Computer",
      "code": "IT-001",
      "status": "ACTIVE",
      "categoryId": "uuid",
      "data": {
        "serial_number": "SN123456",
        "purchase_date": "2024-01-15"
      },
      "category": {
        "id": "uuid",
        "name": "Electronics"
      },
      "images": [],
      "createdAt": "2025-02-14T12:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### GET /assets/:id

Get single asset details.

### POST /assets

Create a new asset.

**Request Body**
```json
{
  "name": "Laptop Computer",
  "code": "IT-001",
  "status": "ACTIVE",
  "categoryId": "uuid",
  "data": {
    "serial_number": "SN123456",
    "purchase_date": "2024-01-15",
    "price": 8000
  }
}
```

### PUT /assets/:id

Update an existing asset.

### DELETE /assets/:id

Soft delete an asset.

### POST /assets/batch-delete

Batch delete multiple assets.

**Request Body**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### GET /assets/grouped

Get assets grouped by a field.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| groupBy | string | Field to group by: `status`, `category`, `month`, or custom field name |

---

## Category Endpoints

### GET /categories

Get category tree.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "parentId": null,
      "children": [
        {
          "id": "uuid-2",
          "name": "Computers",
          "parentId": "uuid",
          "children": []
        }
      ]
    }
  ]
}
```

### POST /categories

Create a new category.

### PUT /categories/:id

Update a category.

### DELETE /categories/:id

Delete a category (fails if has children or linked assets).

---

## Import/Export Endpoints

### POST /import/excel

Import assets from Excel file.

**Request**
- Content-Type: `multipart/form-data`
- File field: `file`
- Mapping field: `mapping` (JSON string)

**Response**
```json
{
  "success": true,
  "data": {
    "imported": 100,
    "skipped": 5,
    "errors": []
  }
}
```

### GET /import/template

Download Excel import template.

### POST /import/database/test

Test database connection.

**Request Body**
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

### POST /import/database/preview

Preview data from external database table.

### POST /import/database

Import from external database.

### GET /export/excel

Export assets to Excel.

**Query Parameters**
| Parameter | Description |
|-----------|-------------|
| fields | Comma-separated list of fields to export |
| filters | JSON filter string |

### GET /export/csv

Export assets to CSV.

### GET /export/images

Export asset images as ZIP file.

---

## Image Endpoints

### POST /assets/:id/images

Upload images for an asset.

**Request**
- Content-Type: `multipart/form-data`
- File field: `images` (supports multiple files)

### GET /assets/:id/images

Get all images for an asset.

### DELETE /assets/:id/images/:imageId

Delete an image.

---

## Report Endpoints

### GET /reports/stats/overview

Get dashboard overview statistics.

**Response**
```json
{
  "success": true,
  "data": {
    "total": 1000,
    "activeCount": 800,
    "idleCount": 100,
    "damagedCount": 50,
    "scrappedCount": 50,
    "thisMonthNew": 20
  }
}
```

### GET /reports/stats/by-status

Get asset count by status.

### GET /reports/stats/by-category

Get asset count by category.

### GET /reports/stats/by-month

Get asset count by creation month.

### GET /reports/templates

Get all report templates.

### POST /reports/templates

Create a report template.

### PUT /reports/templates/:id

Update a report template.

### DELETE /reports/templates/:id

Delete a report template.

---

## User Management Endpoints

### GET /users

Get paginated list of users.

**Query Parameters**
| Parameter | Description |
|-----------|-------------|
| page | Page number |
| pageSize | Items per page |
| search | Search by username or name |
| role | Filter by role |
| active | Filter by status |

### POST /users

Create a new user.

**Request Body**
```json
{
  "username": "newuser",
  "password": "Password123",
  "name": "New User",
  "email": "user@example.com",
  "role": "USER"
}
```

### PUT /users/:id

Update user information.

### DELETE /users/:id

Delete a user.

### PUT /users/:id/role

Update user role.

### PUT /users/:id/status

Activate/deactivate user.

### POST /users/:id/reset-password

Reset user password.

---

## Operation Log Endpoints

### GET /logs

Get paginated operation logs.

**Query Parameters**
| Parameter | Description |
|-----------|-------------|
| page | Page number |
| pageSize | Items per page |
| action | Filter by action type |
| entityType | Filter by entity type |
| startDate | Filter from date |
| endDate | Filter to date |

### GET /logs/:id

Get log detail.

---

## Backup Endpoints

### GET /backup

List all backup files.

### POST /backup

Create a new backup.

### GET /backup/:filename

Download a backup file.

### POST /backup/:filename/restore

Restore from a backup file.

### DELETE /backup/:filename

Delete a backup file.

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ERROR` | Duplicate data |
| `FOREIGN_KEY_ERROR` | Foreign key constraint violation |
| `FILE_TOO_LARGE` | File exceeds size limit |
| `INVALID_FILE_TYPE` | Invalid file type |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Internal server error |

---

*API Version: 1.0.0*
*Last Updated: 2025-02-17*
