# Contributing Guide

Thank you for your interest in contributing to the Asset Management System! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be considerate of others and follow standard open-source community guidelines.

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher (or pnpm)
- Git
- A code editor (VS Code recommended)

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/asset-management-system.git
cd asset-management-system

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/asset-management-system.git
```

## Development Setup

### Installation

```bash
# Install root dependencies (for E2E tests)
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Database Setup

```bash
cd server

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### Running the Application

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3002
- API Docs: http://localhost:3002/api/docs

### Running Tests

```bash
# Backend unit tests
cd server && npm test

# Backend test with coverage
cd server && npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level components
│   │   ├── lib/           # Utilities and API client
│   │   ├── stores/        # Zustand stores
│   │   └── i18n/          # Internationalization
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Express middleware
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── ...
├── docs/                   # Documentation
├── e2e/                    # E2E tests
└── ...
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use Zod for runtime validation

### React

- Use functional components with hooks
- Follow the [React Hook rules](https://react.dev/warnings/invalid-hook-call-warning)
- Keep components small and focused
- Use TypeScript for props

### Styling

- Use TailwindCSS utility classes
- Follow the existing color scheme and design patterns
- Ensure responsive design (mobile-first)

### Code Style

- Use ESLint and Prettier configurations
- Run `npm run lint` before committing
- Format code with Prettier

```bash
# Check linting
cd client && npm run lint
cd server && npm run lint
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tools |

### Examples

```
feat(assets): add bulk delete functionality
fix(import): resolve Excel parsing error for large files
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(api): extract common response formatting
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Add tests for new features
   - Ensure all tests pass

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting the PR

1. Go to GitHub and create a Pull Request
2. Fill out the PR template completely
3. Link any related issues
4. Request review from maintainers

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New features have corresponding tests
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the bug
2. **Steps to reproduce** - Detailed steps
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Screenshots** - If applicable
6. **Environment**:
   - OS: [e.g., Windows 11, macOS 14]
   - Browser: [e.g., Chrome 120]
   - Node.js version: [e.g., 20.10.0]

### Feature Requests

For feature requests, please include:

1. **Problem statement** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches you've thought of
4. **Additional context** - Any other relevant information

## Getting Help

- Open a GitHub Discussion for questions
- Join our community chat (if available)
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
