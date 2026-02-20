# Asset Management System

[![Version](https://img.shields.io/badge/version-1.5.0-green.svg)](https://github.com/zweien/asset-anagement-system/releases/tag/v1.5.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-336791.svg)](https://www.postgresql.org/)

A modern, full-stack asset management system with dynamic field configuration, Excel import/export, AI assistant, and comprehensive reporting capabilities.

**🎉 Version 1.5.0 Released!** - Added PostgreSQL database support with migration tools.

[中文文档](./README_CN.md) | [Documentation](./docs/) | [API Reference](./docs/API.md) | [Changelog](./docs/CHANGELOG.md)

## 📸 Screenshots

![Dashboard](./docs/snipaste_dashboard.png)

## ✨ Features

- 🤖 **AI Assistant** - Query and analyze asset data using natural language
- 📊 **Dynamic Field Configuration** - Create custom fields without modifying the database schema
- 📥 **Excel Import/Export** - Batch import from Excel files with field mapping
- 🗄️ **Database Migration** - Import data from external databases (MySQL, PostgreSQL, SQLite)
- 🐘 **PostgreSQL Support** - Native PostgreSQL support with JSONB queries and data migration tools
- 📈 **Visual Reports** - Charts and statistics with customizable report templates
- 🔍 **SQL Query** - Admin users can execute safe SQL queries directly
- 🌐 **Internationalization** - Full i18n support with Chinese and English translations
- 🌓 **Dark Mode** - Built-in theme switching with system preference detection
- 🔐 **Role-Based Access Control** - Admin, Editor, and User roles with granular permissions, batch user import via Excel
- 📝 **Audit Logging** - Complete operation history with change tracking
- 💾 **Backup & Restore** - Database backup and restore functionality
- 📱 **Responsive Design** - Mobile-friendly UI built with shadcn/ui
- ⌨️ **Keyboard Shortcuts** - Alt+N (new asset), Alt+K (search), Alt+/ (help)
- 🐳 **Docker Ready** - One-command deployment with Docker Compose

## 🤖 AI Assistant

The AI assistant enables natural language interaction for easier data queries:

- **Natural Language Queries** - "Show all active assets"
- **Statistical Analysis** - "Count assets added last month"
- **Quick Questions** - One-click common queries
- **Streaming Responses** - Real-time AI replies
- **Markdown Rendering** - Tables, code blocks, and lists properly formatted
- **Chat Export** - Export conversations as Markdown or JSON
- **Custom Field Queries** - AI understands and queries dynamic custom fields stored in JSON
- **Safe & Controlled** - SELECT-only queries with rate limiting
- **Multi-API Support** - Chat Completions and Responses API endpoints

Supported LLM Providers:
- DeepSeek (Recommended)
- OpenAI
- Moonshot (Kimi)
- SiliconFlow
- Other OpenAI-compatible APIs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/zweien/asset-anagement-system.git
cd asset-management-system

# Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Initialize the database
cd server
npm run db:push
cd ..

# Start development servers
./init.sh start
```

Or start manually:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Access the application at http://localhost:5173

### Docker Deployment (Recommended)

Deploy with Docker Compose in one command:

```bash
# Clone the repository
git clone https://github.com/zweien/asset-anagement-system.git
cd asset-management-system

# Start with one command (build + run)
docker-compose up -d --build

# View logs (get the randomly generated admin password)
docker-compose logs | grep -A4 "默认管理员"

# Check status
docker-compose ps
```

Access the application at http://localhost:3002

**Production Configuration:**

```bash
# Set custom JWT secret
export JWT_SECRET=your-secure-secret-key-at-least-32-chars
docker-compose up -d
```

**PostgreSQL Deployment:**

For larger scale deployments, use PostgreSQL:

```bash
# Start with PostgreSQL
docker-compose up -d postgres app-postgres --build

# Access at http://localhost:3002
```

**Common Docker Commands:**

```bash
docker-compose up -d        # Start in background
docker-compose logs -f      # View logs
docker-compose ps           # Check status
docker-compose down         # Stop services
docker-compose down -v      # Stop and remove volumes
```

### Database Options

The system supports both SQLite and PostgreSQL:

**SQLite (Default)**
- Zero configuration, file-based storage
- Ideal for small to medium deployments
- Data stored in `data/assets.db`

**PostgreSQL (Recommended for Production)**
- Better performance for large datasets
- Native JSONB queries for dynamic fields
- Concurrent access support

To switch to PostgreSQL:

```bash
# 1. Start PostgreSQL container
docker-compose up -d postgres

# 2. Copy PostgreSQL schema
cp server/prisma/schema.postgresql.prisma server/prisma/schema.prisma

# 3. Push schema to database
cd server && npm run db:generate && npm run db:push

# 4. Set environment variable
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/assets"

# 5. (Optional) Migrate existing SQLite data
npm run db:migrate-pg

# 6. Start server
npm run dev
```

### Configure AI Assistant (Optional)

1. Login as administrator
2. Go to Settings page
3. Fill in "AI Model Configuration":
   - API Key
   - API Base URL (e.g., https://api.deepseek.com)
   - Model Name (e.g., deepseek-chat)
   - API Endpoint Type:
     - **Chat Completions** - Better compatibility with most LLM providers (Recommended)
     - **Responses API** - OpenAI's advanced API with more features

You can also configure via environment variables (as defaults):
```bash
# server/.env
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
AI_MAX_TOKENS=2000
```

### Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

> ⚠️ Please change the default password after first login!

## 📁 Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ai/         # AI assistant components
│   │   ├── pages/          # Route-level page components
│   │   ├── lib/            # Utilities, API client, types
│   │   ├── stores/         # Zustand state management
│   │   ├── hooks/          # Custom React hooks
│   │   └── i18n/           # Internationalization
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Express middleware
│   │   ├── prompts/        # AI prompts
│   │   └── utils/          # Utilities
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── docs/                   # Documentation
├── e2e/                    # E2E tests
└── uploads/                # File uploads
```

## 🛠️ Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 | Express.js |
| TypeScript | TypeScript |
| Vite | Prisma ORM |
| TailwindCSS v4 | SQLite / PostgreSQL / MySQL |
| shadcn/ui | JWT Authentication |
| Zustand | Swagger/OpenAPI |
| React Router | Winston Logger |
| Recharts | Zod Validation |
| i18next | Vercel AI SDK |
| @ai-sdk/react | @ai-sdk/openai |

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture and design decisions
- [API Reference](./docs/API.md) - REST API documentation
- [Contributing](./docs/CONTRIBUTING.md) - How to contribute
- [Changelog](./docs/CHANGELOG.md) - Version history

## 🧪 Testing

```bash
# Backend unit tests
cd server && npm test

# Frontend unit tests
cd client && npm test

# Frontend test coverage
cd client && npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Recharts](https://recharts.org/) - Composable charting library
- [Lucide Icons](https://lucide.dev/) - Beautiful open-source icons
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI application development toolkit

---

Made with ❤️ by the Asset Management Team
