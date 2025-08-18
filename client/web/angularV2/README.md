# Angular V2 Multi-Project Workspace

A modern Angular 20+ multi-project workspace designed for building scalable chat applications with advanced theming capabilities, microservice integration, and enterprise-grade tooling.

## 🏗️ Architecture

This workspace follows a multi-project architecture with:

- **Main Application** (`angular-v2-workspace`) - Root application for development
- **Chat App** (`projects/chat-app`) - Main chat application with real-time features
- **Admin Panel** (`projects/admin-panel`) - Administrative interface
- **Mobile Shell** (`projects/mobile-shell`) - Mobile-optimized application shell
- **Shared Library** (`projects/shared-lib`) - Reusable components and services

## 🚀 Features

- **Angular 20+** with Standalone Components and Signals
- **TypeScript 5.8+** with strict mode and advanced type checking
- **Multi-theme system** with dynamic switching and accessibility support
- **Microservice integration** ready for NestJS backend
- **Modern tooling** with ESLint, Prettier, Husky, and Commitlint
- **pnpm workspace** for efficient dependency management
- **SSR support** for chat-app and mobile-shell
- **PWA capabilities** for offline-first experience

## 📦 Projects Structure

```
client/web/angularV2/
├── projects/
│   ├── chat-app/           # Main chat application (SSR enabled)
│   ├── admin-panel/        # Admin interface (SPA)
│   ├── mobile-shell/       # Mobile-optimized shell (SSR enabled)
│   └── shared-lib/         # Shared components and services
├── src/                    # Root application
├── .husky/                 # Git hooks
├── .vscode/                # VS Code configuration
└── docs/                   # Documentation (to be created)
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Angular CLI 20+

### Installation

```bash
# Install dependencies
pnpm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli@latest
```

### Development Commands

```bash
# Serve main application
pnpm start
# or
ng serve

# Serve specific project
ng serve chat-app
ng serve admin-panel
ng serve mobile-shell

# Build all projects
pnpm build

# Build specific project
ng build chat-app --configuration production

# Run tests
pnpm test
pnpm test:ci
pnpm test:coverage

# Lint and format
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check

# Generate new components/services
ng generate component my-component --project=chat-app
ng generate service my-service --project=shared-lib
```

## 🎨 Theming System

The workspace includes an advanced multi-theme system supporting:

- **6+ predefined themes** (Default, Indigo, Teal, Purple, Amber, Rose)
- **Light/Dark mode variants** for each theme
- **Dynamic theme switching** with smooth transitions
- **Accessibility compliance** (WCAG 2.1 AA)
- **Custom brand themes** with palette generation
- **System theme detection** and auto-switching

## 🔧 Code Quality

### ESLint Configuration
- Angular-specific rules
- TypeScript strict rules
- Accessibility checks
- Code complexity limits

### Prettier Configuration
- Consistent code formatting
- File-specific rules for HTML, SCSS, JSON
- Integration with ESLint

### Git Hooks (Husky)
- **Pre-commit**: Lint-staged with ESLint and Prettier
- **Commit-msg**: Conventional commit validation

### Commit Convention
```
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore, ci, build, perf, revert
# Example: feat(chat): add real-time message notifications
```

## 🏃‍♂️ Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm start` | Start development server |
| `pnpm build` | Build all projects |
| `pnpm build:prod` | Production build |
| `pnpm test` | Run unit tests |
| `pnpm test:ci` | Run tests in CI mode |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm lint` | Lint all projects |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |
| `pnpm analyze` | Analyze bundle size |
| `pnpm generate:lib` | Generate new library |
| `pnpm generate:app` | Generate new application |

## 🔗 Backend Integration

This workspace is designed to integrate with:

- **NestJS microservices** architecture
- **GraphQL APIs** with Apollo Client
- **WebSocket connections** for real-time features
- **JWT authentication** system
- **Redis caching** layer
- **MongoDB/PostgreSQL** databases

## 📱 Mobile Support

The `mobile-shell` project provides:
- Touch-optimized interactions
- Progressive Web App (PWA) capabilities
- Mobile-specific theme adaptations
- Offline-first experience
- Responsive design patterns

## 🧪 Testing Strategy

- **Unit Tests**: Jest with 95%+ coverage target
- **Integration Tests**: Angular Testing Library
- **E2E Tests**: Cypress/Playwright (to be configured)
- **Accessibility Tests**: Automated a11y testing
- **Performance Tests**: Core Web Vitals monitoring

## 📚 Documentation

- [Architecture Decision Records](./docs/architecture/) (to be created)
- [Component Library](./docs/components/) (to be created)
- [Theming Guide](./docs/theming/) (to be created)
- [API Integration](./docs/api/) (to be created)

## 🤝 Contributing

1. Follow the conventional commit format
2. Ensure all tests pass
3. Maintain 95%+ test coverage
4. Update documentation as needed
5. Use the provided ESLint and Prettier configurations

## 📄 License

This project is part of the larger chat application system and follows the same licensing terms.

## 🔧 VS Code Configuration

The workspace includes VS Code settings for:
- Angular Language Service
- ESLint integration
- Prettier formatting
- TypeScript debugging
- Recommended extensions

## 🚀 Deployment

The workspace supports deployment to:
- **Development**: Local development server
- **Staging**: Docker containers with nginx
- **Production**: CDN with SSR support
- **Mobile**: PWA deployment

For detailed deployment instructions, see the deployment documentation (to be created).

---

Built with ❤️ using Angular 20+, TypeScript 5.8+, and modern web technologies.