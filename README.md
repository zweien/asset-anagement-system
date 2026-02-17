# Asset Management System

[![Version](https://img.shields.io/badge/version-1.0.2-green.svg)](https://github.com/zweien/asset-anagement-system/releases/tag/v1.0.2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)

A modern, full-stack asset management system with dynamic field configuration, Excel import/export, and comprehensive reporting capabilities.

**🎉 Version 1.0.2 Released!** - Added batch selection and delete functionality.

[中文文档](./README_CN.md) | [Documentation](./docs/) | [API Reference](./docs/API.md) | [Changelog](./docs/CHANGELOG.md)

## 📸 Screenshots

![Dashboard](./docs/snipaste_dashboard.png)

## ✨ Features

- 📊 **Dynamic Field Configuration** - Create custom fields without modifying the database schema
- 📥 **Excel Import/Export** - Batch import from Excel files with field mapping
- 🗄️ **Database Migration** - Import data from external databases (MySQL, PostgreSQL, SQLite)
- 📈 **Visual Reports** - Charts and statistics with customizable report templates
- 🌐 **Internationalization** - Full i18n support with Chinese and English translations
- 🌓 **Dark Mode** - Built-in theme switching with system preference detection
- 🔐 **Role-Based Access Control** - Admin, Editor, and User roles with granular permissions
- 📝 **Audit Logging** - Complete operation history with change tracking
- 💾 **Backup & Restore** - Database backup and restore functionality
- 📱 **Responsive Design** - Mobile-friendly UI built with shadcn/ui

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
| i18next | |

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture and design decisions
- [API Reference](./docs/API.md) - REST API documentation
- [Contributing](./docs/CONTRIBUTING.md) - How to contribute
- [Changelog](./docs/CHANGELOG.md) - Version history

## 🧪 Testing

```bash
# Backend unit tests
cd server && npm test

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

---

Made with ❤️ by the Asset Management Team
