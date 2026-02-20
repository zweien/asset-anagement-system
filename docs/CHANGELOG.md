# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-02-20

### Added
- **PostgreSQL Database Support** - Native PostgreSQL support for enterprise deployments
  - Auto-detect database type from `DATABASE_URL` environment variable
  - PostgreSQL uses native JSONB type for dynamic fields with efficient queries
  - SQLite remains the default for backward compatibility
- **Database Migration Tool** - Seamless SQLite to PostgreSQL data migration
  - `npm run db:migrate-pg` command for one-click migration
  - Automatic JSON field conversion (String → Json)
  - Migration report with success/failure summary
- **Database Connection Layer** - Centralized PrismaClient management
  - Singleton pattern to avoid connection pool issues
  - Export `isPostgreSQL()`, `isSQLite()`, `getPrismaClient()` utilities
- **JSON Query Adapter** - Database-agnostic JSON field queries
  - `PostgresJsonQueryAdapter` for native JSONB queries
  - `SqliteJsonQueryAdapter` for application-layer filtering
  - Unified `evaluateJsonCondition()` for both databases
- **Docker PostgreSQL Service** - Ready-to-use PostgreSQL container
  - `app-postgres` service for PostgreSQL mode
  - `postgres` service with PostgreSQL 16 Alpine
  - Health checks for proper startup order
  - Docker volume for data persistence

### Changed
- **Service Layer Refactoring** - All 12 service files now use shared PrismaClient
  - Prevents connection pool exhaustion
  - Consistent database access patterns
- **SQL Query Service** - Enhanced for PostgreSQL compatibility
  - `getTableSchema()` supports both PRAGMA and information_schema
  - AI system prompt provides database-specific JSON query syntax
- **init.sh** - Added new database commands
  - `./init.sh db:detect` - Detect current database type
  - `./init.sh db:migrate-pg` - Migrate SQLite data to PostgreSQL

### Technical Details
- Added `better-sqlite3` for migration script
- Created `server/src/lib/database.ts` for database connection management
- Created `server/src/lib/json-query.ts` for JSON query abstraction
- Created `server/src/scripts/migrate-to-postgres.ts` for data migration
- Added `server/prisma/schema.postgresql.prisma` for PostgreSQL schema
- Added `server/.env.postgresql.example` for configuration reference

## [1.4.0] - 2026-02-19

### Added
- **Docker Containerization** - Full Docker support for easy deployment
  - Multi-stage Dockerfile for optimized production builds
  - Docker Compose configuration with volume mounts
  - One-command deployment: `docker-compose up -d`
  - Health checks and automatic restarts
- **Frontend Unit Testing** - Vitest + Testing Library setup
  - 19 test cases for utils and EmptyState component
  - Test coverage reporting with v8
  - Watch mode and UI mode for development
- **Image Lazy Loading & Optimization** - Performance improvements for image handling
  - Native `loading="lazy"` attribute for images
  - Canvas-based image compression (max 1920x1080, 0.8 quality)
  - Full-screen image preview dialog
- **Keyboard Shortcuts** - Productivity boost with keyboard navigation
  - `Alt+N` - Create new asset
  - `Alt+K` - Focus search input
  - `Alt+S` - Save form
  - `Alt+/` - Show keyboard shortcuts help
  - `Escape` - Close dialogs
- **AI Provider Presets** - Quick configuration for popular LLM providers
  - DeepSeek (default), OpenAI, Moonshot, Anthropic, GLM, Qwen, SiliconFlow
  - Auto-fill Base URL and model list based on provider selection

### Fixed
- **Keyboard Shortcut Conflicts** - Changed from Ctrl to Alt to avoid browser conflicts
- **Logo Background** - Transparent PNG logos now display correctly in both themes
- **Page Instructions** - Updated all pages with keyboard shortcut hints

### Technical Details
- Added `vitest`, `@testing-library/react`, `@testing-library/jest-dom` for testing
- Created `useKeyboard` hook for keyboard event handling
- Created `LazyImage` and `ImagePreview` components
- Updated `init.sh` with Docker commands

## [1.3.0] - 2026-02-19

### Added
- **AI Custom Field Queries** - AI can now query and analyze custom fields stored in JSON
  - Automatic field configuration included in system prompt
  - Uses SQLite `json_extract()` function for JSON field queries
  - Full support for TEXT, NUMBER, DATE, SELECT, MULTISELECT field types
- **User Batch Import** - Import multiple users at once via Excel template
  - Download pre-configured Excel template with all required fields
  - Upload and parse Excel file for batch user creation
  - Validation and error reporting for invalid entries
  - Success/failure summary after import

### Fixed
- **Markdown Rendering** - Removed extra whitespace before tables in AI chat responses
- **i18n Translations** - Added missing `close` and `remove` translation keys

### Technical Details
- Enhanced AI system prompt with field configuration and JSON query guidance
- Added multer file upload for user import endpoint
- Added xlsx library for Excel template generation and parsing

## [1.2.0] - 2026-02-18

### Added
- **API Endpoint Type Selection** - Choose between Chat Completions and Responses API
  - Chat Completions (`/v1/chat/completions`) - Better compatibility with most LLM providers
  - Responses API (`/v1/responses`) - OpenAI's advanced API with more features
  - Configurable in Settings page, default is Chat Completions for maximum compatibility
- **Markdown Rendering in AI Chat** - Rich text display for AI responses
  - Tables, code blocks, lists, and headers properly formatted
  - Syntax highlighting for code blocks
  - Smooth streaming with partial markdown support
- **Chat Export Functionality** - Export AI conversations
  - Export as Markdown (.md) - Human-readable format
  - Export as JSON (.json) - Structured data for processing
  - Includes tool invocations and SQL query results

### Fixed
- **AI Configuration Loading** - Now properly reads configuration from `.env` file as fallback
  - Priority: Database config > Environment variables > Default values
  - Supports `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `AI_MODEL`, `AI_MAX_TOKENS` env vars
- **BigInt Serialization** - Fixed SQL query results with COUNT(*) returning BigInt values

### Technical Details
- Added `streamdown` and `@streamdown/code` for markdown rendering
- Added `@tailwindcss/typography` for prose styling
- AI service now uses `openai.chat()` or `openai.responses()` based on configuration

## [1.1.0] - 2026-02-18

### Added
- **AI Assistant Integration** - Natural language interaction with asset data using LLM
  - Streaming chat interface with real-time responses
  - SQL query execution tool for data retrieval
  - Quick question buttons for common queries
  - Rate limiting (20 requests/minute, 100 requests/day)
- **AI Model Configuration** - Frontend configuration for LLM settings
  - Configure API Key, Base URL, Model name, Max Tokens
  - Support for OpenAI-compatible APIs (DeepSeek, SiliconFlow, etc.)
  - Settings stored in database, no server restart required
- **SQL Query Feature** - Direct SQL query capability for admin users
  - Safe SELECT-only queries with SQL injection protection
  - Table whitelist and sensitive field filtering
  - Query results displayed in table format

### Technical Details
- Backend: Vercel AI SDK v6 with streamText and tool calling
- Frontend: Custom streaming chat component with SSE support
- Security: JWT authentication, rate limiting, SQL validation

## [1.0.3] - 2026-02-18

### Added
- **User Avatar** - Users can now upload and display custom avatars
- **System Logo & Name** - Administrators can customize system logo and name in settings
- **Filter Icon Highlighting** - Active filter icons are now highlighted with primary color and animated indicator
- **Clear All Filters Button** - One-click to clear all active filters

### Fixed
- **Status Field Filter** - Added filter button for status field with proper dropdown options

## [1.0.2] - 2026-02-18

### Added
- **Batch Selection & Delete** - Added checkbox column for selecting multiple assets and batch delete functionality

### Fixed
- **Filter Panel Error** - Fixed SelectItem empty string value error in filter panel
- **Batch Delete Row Selection** - Fixed row selection using row indices instead of asset IDs

## [1.0.1] - 2026-02-17

### Fixed
- **Image Upload** - Fixed image upload and display functionality with proper authentication
- **TailwindCSS Colors** - Fixed primary color classes for light/dark theme consistency
- **Asset Detail** - Filtered out system fields in asset detail page to prevent duplicate display
- **Duplicate Status Column** - Removed duplicate status column in assets table

## [1.0.0] - 2026-02-17

### Added

#### Core Features
- **Dynamic Field Configuration** - Create custom fields without database migrations
- **Asset Management** - Full CRUD operations with filtering, sorting, and pagination
- **Excel Import/Export** - Batch import with field mapping and template download
- **Database Import** - Import from external MySQL, PostgreSQL, SQLite databases
- **Visual Reports** - Charts and statistics with customizable templates
- **Operation Logging** - Complete audit trail with change tracking
- **Backup & Restore** - Database backup and restore functionality

#### Authentication & Authorization
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, Editor, User roles
- **User Management** - Create, edit, activate/deactivate users
- **Password Management** - Secure password with complexity requirements

#### UI/UX
- **Internationalization** - Full i18n support (Chinese, English)
- **Dark Mode** - Theme switching with system preference detection
- **Responsive Design** - Mobile-friendly interface with bottom navigation
- **shadcn/ui Components** - Modern, accessible UI components
- **Animation System** - Smooth micro-interactions with Framer Motion
- **Empty States** - Friendly empty state components with guidance
- **Skeleton Loading** - Content-aware loading placeholders

#### Security
- **XSS Protection** - Input sanitization for all user data
- **Input Validation** - Zod schemas for all API endpoints
- **Secure JWT** - Environment-based secret key configuration
- **Password Policy** - Strong password requirements (8+ chars, mixed case, numbers)

#### Developer Experience
- **Swagger API Documentation** - Interactive API docs at `/api/docs`
- **TypeScript** - Full type safety across frontend and backend
- **E2E Testing** - Playwright integration tests
- **Unit Testing** - Vitest for backend services
- **Database Indexing** - Optimized queries with proper indexes

### Technical Details

#### Frontend
- React 19 with Vite 7
- TailwindCSS v4
- shadcn/ui component library
- Zustand for state management
- React Router v7
- TanStack Table for data grids
- TanStack Virtual for large lists
- Recharts for visualizations
- i18next for internationalization
- Framer Motion for animations

#### Backend
- Express.js with TypeScript
- Prisma ORM
- SQLite (default), PostgreSQL, MySQL support
- JWT authentication
- Winston logging
- Swagger/OpenAPI documentation
- Multer for file uploads
- Zod for validation

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.4.0 | 2026-02-19 | Docker deployment, frontend testing, image optimization, keyboard shortcuts |
| 1.3.0 | 2026-02-19 | AI custom field queries, user batch import |
| 1.2.0 | 2026-02-18 | API endpoint selection, Markdown rendering, Chat export |
| 1.1.0 | 2026-02-18 | AI assistant integration, frontend LLM configuration |
| 1.0.3 | 2026-02-18 | User avatar, system branding, filter enhancements |
| 1.0.2 | 2026-02-18 | Batch selection and delete feature |
| 1.0.1 | 2026-02-17 | Bug fixes for image upload and UI |
| 1.0.0 | 2026-02-17 | First stable release |

---

## Future Plans

### [1.5.0] - Planned
- Redis caching for improved performance
- Real-time notifications with WebSockets
- Advanced reporting with export to PDF
- Batch operations with progress tracking

### [2.0.0] - Planned
- CI/CD pipeline with GitHub Actions
- Plugin system for custom extensions
- Advanced audit log with data comparison
- Two-factor authentication

---

[1.4.0]: https://github.com/zweien/asset-management-system/releases/tag/v1.4.0
[1.3.0]: https://github.com/zweien/asset-management-system/releases/tag/v1.3.0
[1.2.0]: https://github.com/zweien/asset-management-system/releases/tag/v1.2.0
[1.1.0]: https://github.com/zweien/asset-management-system/releases/tag/v1.1.0
[1.0.3]: https://github.com/zweien/asset-management-system/releases/tag/v1.0.3
[1.0.2]: https://github.com/zweien/asset-anagement-system/releases/tag/v1.0.2
[1.0.1]: https://github.com/zweien/asset-anagement-system/releases/tag/v1.0.1
[1.0.0]: https://github.com/zweien/asset-anagement-system/releases/tag/v1.0.0
