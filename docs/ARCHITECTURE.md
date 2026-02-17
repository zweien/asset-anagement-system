# System Architecture

This document provides a comprehensive overview of the Asset Management System's architecture, design decisions, and technical implementation details.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [Security](#security)
- [Performance Considerations](#performance-considerations)

## Overview

### Project Information

| Item | Description |
|------|-------------|
| **Name** | Asset Management System |
| **Version** | 1.0.0 |
| **Target Users** | Enterprise asset managers |
| **Scale** | 10,000+ records |

### Core Features

- Asset CRUD operations with dynamic fields
- Custom field configuration without schema changes
- Excel and database import/export
- Photo capture and upload
- Data visualization and reporting

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React 19 + Vite + TailwindCSS v4                        │   │
│  │  - React Router (Routing)                                │   │
│  │  - TanStack Table (Data tables)                          │   │
│  │  - Zustand (State management)                            │   │
│  │  - Axios (HTTP client)                                   │   │
│  │  - i18next (Internationalization)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server (Node.js)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Express + TypeScript                                    │   │
│  │  - Controllers (Request handling)                        │   │
│  │  - Services (Business logic)                             │   │
│  │  - Middleware (Auth, validation, logging)               │   │
│  │  - Prisma Client (ORM)                                   │   │
│  │  - Swagger (API documentation)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    SQLite       │ │  Local Storage  │ │  External DB    │
│  (assets.db)    │ │   (uploads/)    │ │ (MySQL/PG)      │
│  - Asset data   │ │   - Images      │ │  - Import source│
│  - Users        │ │   - Backups     │ │                 │
│  - Config       │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Frontend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.9.x | Type safety |
| Vite | 7.x | Build tool |
| TailwindCSS | 4.x | Styling |
| shadcn/ui | latest | Component library |
| Zustand | 5.x | State management |
| React Router | 7.x | Routing |
| TanStack Table | 8.x | Data tables |
| Axios | 1.x | HTTP client |
| i18next | 25.x | Internationalization |
| Recharts | 3.x | Data visualization |

### Directory Structure

```
client/src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── ui/              # shadcn/ui components
├── pages/               # Route-level page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Assets.tsx       # Asset management
│   ├── Import.tsx       # Data import
│   ├── Reports.tsx      # Statistics & reports
│   ├── Settings.tsx     # Field configuration
│   ├── UserManagement.tsx
│   └── Logs.tsx         # Operation logs
├── lib/                 # Core utilities
│   ├── api.ts          # API client and types
│   ├── utils.ts        # Utility functions
│   └── toast.ts        # Toast notifications
├── stores/              # Zustand stores
│   ├── authStore.ts    # Authentication state
│   └── permissionStore.ts
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
│   ├── index.ts        # i18n configuration
│   └── locales/        # Translation files
│       ├── zh-CN.json
│       └── en-US.json
└── App.tsx              # Root component
```

### State Management

The application uses Zustand for global state management:

| Store | Purpose |
|-------|---------|
| `authStore` | User authentication, login/logout, session management |
| `permissionStore` | Role-based permissions, feature flags |

Local component state is managed with React's `useState` and `useReducer`.

### Key Components

| Component | Description |
|-----------|-------------|
| `Header` | Navigation, user menu, theme toggle |
| `AssetTable` | Sortable, filterable asset listing |
| `FilterPanel` | Dynamic field filtering |
| `ImportWizard` | Step-by-step import process |
| `ReportBuilder` | Custom report configuration |

## Backend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| JWT | 9.x | Authentication |
| Winston | 3.x | Logging |
| Swagger | 6.x | API documentation |
| Zod | 4.x | Validation |
| xlsx | 0.18.x | Excel processing |

### Layer Architecture

```
┌─────────────────────────────────────────┐
│              Routes Layer                │  API endpoint definitions
├─────────────────────────────────────────┤
│           Middleware Layer               │  Auth, validation, logging
├─────────────────────────────────────────┤
│           Controller Layer               │  Request handling, validation
├─────────────────────────────────────────┤
│            Service Layer                 │  Business logic
├─────────────────────────────────────────┤
│            Data Layer                    │  Prisma ORM
└─────────────────────────────────────────┘
```

### Directory Structure

```
server/src/
├── controllers/         # Request handlers
│   ├── asset.controller.ts
│   ├── auth.controller.ts
│   ├── field.controller.ts
│   ├── import.controller.ts
│   ├── export.controller.ts
│   ├── user.controller.ts
│   └── log.controller.ts
├── services/            # Business logic
│   ├── asset.service.ts
│   ├── import.service.ts
│   ├── export.service.ts
│   ├── backup.service.ts
│   └── user.service.ts
├── routes/              # API routes
│   └── index.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── utils/               # Utilities
│   ├── logger.ts
│   └── backup.ts
└── index.ts             # Application entry
```

### API Response Format

```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: string,
  message?: string
}

// Paginated response
{
  success: true,
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

## Database Design

### Entity Relationship Diagram

```
┌───────────────┐       ┌───────────────┐
│     User      │       │  OperationLog │
├───────────────┤       ├───────────────┤
│ id            │       │ id            │
│ username      │       │ action        │
│ password      │       │ entityType    │
│ name          │       │ entityId      │
│ email         │       │ userId        │
│ role          │       │ oldValue      │
│ active        │       │ newValue      │
│ createdAt     │       │ createdAt     │
└───────────────┘       └───────────────┘

┌───────────────┐       ┌───────────────┐
│  FieldConfig  │       │    Category   │
├───────────────┤       ├───────────────┤
│ id            │       │ id            │
│ name          │       │ name          │
│ label         │       │ parentId      │
│ type          │       │ createdAt     │
│ required      │       └───────────────┘
│ visible       │
│ options       │
│ order         │
└───────────────┘

┌───────────────────────────────────────┐
│                Asset                   │
├───────────────────────────────────────┤
│ id                                    │
│ name                                  │
│ code                                  │
│ status           (ENUM: Active, Idle, Damaged, Scrapped)
│ categoryId                           │
│ data             (JSON - dynamic fields)
│ createdAt                            │
│ updatedAt                            │
│ deletedAt        (Soft delete)        │
└───────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌───────────────────────────────────────┐
│              AssetImage               │
├───────────────────────────────────────┤
│ id                                    │
│ assetId                               │
│ filename                              │
│ path                                  │
│ createdAt                             │
└───────────────────────────────────────┘
```

### Dynamic Field System

The system supports custom fields without schema migrations:

```typescript
// Field types
type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT'

// FieldConfig defines the field structure
interface FieldConfig {
  id: string
  name: string        // Field identifier
  label: string       // Display label
  type: FieldType
  required: boolean
  visible: boolean
  options?: string    // For SELECT types (newline-separated)
  order: number
}

// Asset stores field values in JSON
interface Asset {
  id: string
  name: string
  code: string | null
  status: AssetStatus
  categoryId: string | null
  data: Record<string, any>  // Dynamic field values
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

## Security

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│  Verify  │────▶│  Issue   │
│  Form    │     │ Password │     │   JWT    │
└──────────┘     └──────────┘     └──────────┘
                                        │
                                        ▼
                                 ┌──────────┐
                                 │  Store   │
                                 │  Token   │
                                 └──────────┘
                                        │
                                        ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  API     │────▶│  Verify  │────▶│  Access  │
│  Request │     │   JWT    │     │ Resource │
└──────────┘     └──────────┘     └──────────┘
```

### Authorization (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: all CRUD, user management, system config |
| **Editor** | Asset management, import/export, view reports |
| **User** | Read-only: view assets and reports |

### Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt with salt |
| XSS protection | Input sanitization (xss library) |
| SQL injection | Prisma parameterized queries |
| CORS | Configured origin whitelist |
| Security headers | Helmet middleware |
| Rate limiting | Planned for production |

## Performance Considerations

### Frontend Optimization

| Technique | Implementation |
|-----------|---------------|
| Code splitting | React.lazy for route-level splitting |
| Bundle optimization | Vite's built-in tree shaking |
| Virtual scrolling | @tanstack/react-virtual for large lists |
| Image optimization | Lazy loading, compression |
| Caching | localStorage for user preferences |

### Backend Optimization

| Technique | Implementation |
|-----------|---------------|
| Database indexing | Indexes on frequently queried fields |
| Pagination | Cursor-based for large datasets |
| Query optimization | Prisma select, include optimization |
| Caching | Planned: Redis for hot data |
| Async processing | Planned: BullMQ for heavy operations |

### Database Indexes

```sql
CREATE INDEX idx_assets_name ON assets(name);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(categoryId);
CREATE INDEX idx_assets_created ON assets(createdAt);
CREATE INDEX idx_assets_deleted ON assets(deletedAt);
```

## Deployment

### Development

```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

### Production

```bash
# Build
cd server && npm run build
cd client && npm run build

# Start
cd server && npm start
# Serve client/dist with nginx or similar
```

### Environment Variables

```env
# Server
DATABASE_URL="file:../data/assets.db"
JWT_SECRET="your-secret-key"
PORT=3002

# Optional (for external DB)
# DATABASE_URL="postgresql://user:pass@localhost:5432/assets"
```
