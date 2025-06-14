# Angular Implementation Plan

## Overview
This document outlines the detailed implementation plan for the Angular web client. The implementation uses Angular 20+ with standalone components, providing a modern, performant, and type-safe chat application interface that integrates seamlessly with the existing NestJS microservice architecture.

## Technology Stack

### Core Framework
- **Framework**: Angular 20.0+ (Latest Stable) with Standalone Components
- **Language**: TypeScript 5.8+
- **Package Manager**: pnpm
- **Runtime**: Modern ES2022+ with Zone.js

### Styling & UI
- **CSS Framework**: Tailwind CSS 3.4+
- **UI Component Library**: Angular Material 20+ (CDK + Material Design)
- **Icons**: Material Icons + Lucide Angular

### Data & State Management
- **GraphQL**: Apollo Angular 8+ with GraphQL Code Generator
- **State Management**: NgRx 18+ with ComponentStore for local state
- **Real-time**: WebSocket client with RxJS observables

### Authentication & Security
- **Authentication**: JWT with Angular Guards and Interceptors
- **Session Management**: Secure HTTP-only cookies with Angular HTTP client

### Development & Testing
- **Testing**: Jasmine, Karma, Angular Testing Library, Cypress/Playwright
- **Build Tool**: Angular CLI with esbuild
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Technical Decision Rationale

### Angular 20+ Selection
**Chosen**: Angular 20.0 (Latest Stable)
**Rationale**:
- ✅ **Standalone Components**: Simplified architecture without NgModules
- ✅ **Signals**: Modern reactive programming with Angular Signals
- ✅ **Control Flow**: New @if, @for, @switch syntax for better performance
- ✅ **SSR Improvements**: Enhanced server-side rendering capabilities
- ✅ **TypeScript 5.8+**: Latest TypeScript features and performance
- ✅ **Apollo Angular Compatibility**: Fully tested with Apollo Angular 8+
- ✅ **Material Design 3**: Latest Material Design components
- ✅ **Performance**: Improved change detection and bundle optimization

### UI Component Library Selection
**Chosen**: Angular Material 20+
**Rationale**:
- ✅ **Perfect Angular Integration**: Built specifically for Angular applications
- ✅ **TypeScript First**: Excellent TypeScript support out of the box
- ✅ **Material Design 3**: Latest Material Design principles and components
- ✅ **Accessibility**: WCAG compliant with comprehensive a11y support
- ✅ **Chat-Specific Components**: Excellent dialog, menu, avatar, and list components
- ✅ **CDK Foundation**: Angular Component Dev Kit for custom components
- ✅ **Theming System**: Comprehensive theming with CSS custom properties
- ✅ **Active Maintenance**: Regular updates and long-term support

### State Management Strategy
**Chosen**: NgRx 18+ with ComponentStore
**Rationale**:
- ✅ **NgRx for Global State**: Perfect for authentication, user data, chat conversations
- ✅ **ComponentStore for Local State**: Ideal for component-specific state management
- ✅ **RxJS Integration**: Seamless integration with Angular's reactive patterns
- ✅ **TypeScript Excellence**: Best-in-class TypeScript support with strict typing
- ✅ **DevTools Support**: Excellent debugging with Redux DevTools
- ✅ **Real-time Friendly**: Perfect integration with WebSocket observables
- ✅ **Angular Signals**: Compatible with Angular's new signals API
- ✅ **Performance**: Optimized for Angular's change detection

**State Distribution**:
- **NgRx Store**: Authentication state, user data, chat conversations, global UI state
- **ComponentStore**: Component-specific state, form state, local UI interactions
- **Angular Signals**: Reactive data binding and computed values
- **RxJS Observables**: WebSocket connections, HTTP requests, real-time updates

## Backend Integration

### GraphQL Integration
- **Apollo Federation Gateway**: http://localhost:4000/graphql
- **Schema Download**: Automatic schema introspection and download
- **Type Generation**: GraphQL Code Generator for TypeScript types
- **Apollo Angular**: Optimized for Angular with RxJS observables
- **Caching**: Apollo Client cache with Angular-specific optimizations

### WebSocket Integration
- **WebSocket Gateway**: ws://localhost:4001
- **Real-time Subscriptions**: Chat messages, typing indicators, presence
- **Connection Management**: RxJS-based connection handling with automatic reconnection
- **State Synchronization**: WebSocket updates with NgRx store integration

### Authentication Integration
- **Auth Service**: http://localhost:4002
- **JWT Tokens**: Secure token storage and automatic refresh with interceptors
- **Route Protection**: Angular Guards for protected routes
- **Session Management**: Redis-backed session handling with HTTP interceptors

## Development Phases

### Phase 1: Project Setup and Configuration
- [ ] **1.1 Angular Workspace Setup**
  - [x] Create Angular 20+ workspace with standalone components
  - [x] Configure TypeScript 5.8+ with strict mode
  - [ ] Set up ESLint and Prettier for Angular
  - [ ] Configure Angular CLI with esbuild
  - [ ] Set up Git hooks and commit linting
- [ ] **1.2 UI and Styling Setup**
  - [ ] Configure Tailwind CSS 3.4+ with Angular
  - [ ] Install and configure Angular Material 20+
  - [ ] Set up Material Icons and Lucide Angular
  - [ ] Create Angular Material theme with CSS custom properties
  - [ ] Configure dark/light theme support with Angular CDK
  - [ ] Set up responsive breakpoints with Angular CDK Layout
- [ ] **1.3 Package Management Setup**
  - [ ] Configure pnpm for Angular workspace
  - [ ] Install core Angular dependencies
  - [ ] Configure package.json scripts for Angular CLI
  - [ ] Set up Angular build optimization
  - [ ] Configure development and production environments
- [ ] **1.4 State Management Setup**
  - [ ] Install and configure NgRx 18+ with standalone APIs
  - [ ] Set up authentication store with NgRx
  - [ ] Configure user data store
  - [ ] Set up chat conversation store
  - [ ] Configure NgRx DevTools and effects
  - [ ] Set up ComponentStore for local state management
- [ ] **1.5 GraphQL Configuration**
  - [ ] Install Apollo Angular 8+ and related packages
  - [ ] Configure GraphQL Code Generator for Angular
  - [ ] Set up schema download from Federation Gateway
  - [ ] Create Apollo Angular configuration with RxJS
  - [ ] Configure Apollo Client cache policies for Angular
  - [ ] Set up GraphQL error handling with Angular ErrorHandler
- [ ] **1.6 WebSocket Configuration**
  - [ ] Install WebSocket client packages for Angular
  - [ ] Create RxJS-based WebSocket service
  - [ ] Set up subscription management with observables
  - [ ] Configure reconnection logic with RxJS operators
  - [ ] Integrate WebSocket with NgRx store
  - [ ] Set up WebSocket error handling and recovery
- [ ] **1.7 Authentication Setup**
  - [ ] Configure JWT token handling with Angular interceptors
  - [ ] Set up Angular Guards for route protection
  - [ ] Create NgRx authentication store
  - [ ] Configure secure HTTP-only cookies with Angular HTTP client
  - [ ] Set up token refresh mechanism with RxJS
  - [ ] Implement logout and session cleanup

### Phase 2: Core Application Features
- [ ] **2.1 Authentication Implementation**
  - [ ] Create login page with Angular Material forms
  - [ ] Implement registration page with reactive forms
  - [ ] Add password reset functionality with Angular validators
  - [ ] Set up protected route guards
  - [ ] Implement token refresh logic with RxJS
  - [ ] Add OAuth integration (Google, GitHub)
  - [ ] Create authentication error handling
  - [ ] Implement remember me functionality
- [ ] **2.2 User Profile Management**
  - [ ] Create user profile page with Angular Material
  - [ ] Implement profile editing with reactive forms
  - [ ] Add user settings page with Angular Material components
  - [ ] Create user search with Angular Material autocomplete
  - [ ] Implement contact/friend management with NgRx
  - [ ] Add avatar upload functionality
  - [ ] Create user status management
  - [ ] Implement user preferences storage
- [ ] **2.3 Chat Interface Implementation**
  - [ ] Design and implement chat layout with Angular Material
  - [ ] Create conversation list component with virtual scrolling
  - [ ] Implement message thread component with CDK virtual scroll
  - [ ] Add message input with Angular Material and file upload
  - [ ] Create typing indicators with Angular animations
  - [ ] Implement read receipts with Angular Material badges
  - [ ] Add real-time updates with WebSocket observables
  - [ ] Create message search and filtering
- [ ] **2.4 Real-time Features**
  - [ ] WebSocket connection management with RxJS
  - [ ] Subscription handling for chat updates with NgRx effects
  - [ ] User presence and online status with Angular signals
  - [ ] Push notification integration with Angular service worker
  - [ ] Implement typing indicators
  - [ ] Add message delivery status
  - [ ] Create real-time user list updates
  - [ ] Implement connection status indicators

### Phase 3: Security & Performance Implementation
- [ ] **3.1 Security Implementation**
  - [ ] Implement comprehensive authentication security with Angular guards
  - [ ] Add XSS protection and input sanitization with Angular DomSanitizer
  - [ ] Configure CSRF prevention with Angular HTTP interceptors
  - [ ] Set up Content Security Policy (CSP) for Angular
  - [ ] Implement secure cookie configuration with Angular HTTP client
  - [ ] Add rate limiting for API calls
  - [ ] Implement input validation and sanitization
  - [ ] Set up security headers and HTTPS enforcement
- [ ] **3.2 Performance Monitoring**
  - [ ] Set up Core Web Vitals tracking with Angular
  - [ ] Implement bundle size monitoring with Angular CLI
  - [ ] Add error tracking with Angular ErrorHandler
  - [ ] Configure chat-specific performance metrics
  - [ ] Set up real-time performance dashboard with Angular Material
  - [ ] Implement lazy loading for feature modules
  - [ ] Add performance budgets to Angular CLI
  - [ ] Set up bundle analysis and optimization
- [ ] **3.3 Accessibility Implementation**
  - [ ] Implement comprehensive ARIA support with Angular CDK a11y
  - [ ] Add keyboard navigation patterns with Angular Material
  - [ ] Configure screen reader support with Angular CDK
  - [ ] Set up focus management with Angular CDK focus trap
  - [ ] Add accessibility testing automation with Angular testing utilities
  - [ ] Implement high contrast theme support
  - [ ] Add keyboard shortcuts for chat actions
  - [ ] Set up accessibility audit automation

### Phase 4: Advanced Features & Internationalization
- [ ] **4.1 Internationalization (i18n)**
  - [ ] Set up Angular i18n with multiple language support
  - [ ] Implement RTL language support with Angular CDK bidi
  - [ ] Add locale-aware date/time formatting with Angular DatePipe
  - [ ] Configure message content localization with Angular i18n
  - [ ] Set up translation management system with Angular CLI
  - [ ] Implement dynamic language switching
  - [ ] Add locale-specific number and currency formatting
  - [ ] Set up translation extraction and build processes
- [ ] **4.2 Progressive Web App (PWA)**
  - [ ] Implement Angular service worker with offline support
  - [ ] Add push notification system with Angular PWA
  - [ ] Configure offline message caching with Angular service worker
  - [ ] Set up app manifest and installation with Angular PWA
  - [ ] Implement background sync for messages with Angular service worker
  - [ ] Add offline indicator and sync status
  - [ ] Configure app update notifications
  - [ ] Set up PWA analytics and monitoring
- [ ] **4.3 Advanced Chat Features**
  - [ ] Group chat creation and management with Angular Material dialogs
  - [ ] File sharing with preview and security using Angular Material
  - [ ] Message search and filtering with Angular Material search
  - [ ] Chat history and pagination with Angular CDK virtual scrolling
  - [ ] Advanced emoji reactions and formatting with Angular Material
  - [ ] Implement message threading and replies
  - [ ] Add voice message recording and playback
  - [ ] Create chat export and backup functionality
- [ ] **4.4 Enhanced User Experience**
  - [ ] Implement drag-and-drop file uploads with Angular CDK
  - [ ] Add message formatting (bold, italic, code blocks)
  - [ ] Create custom emoji and sticker support
  - [ ] Implement chat themes and customization
  - [ ] Add message scheduling and reminders
  - [ ] Create chat templates and quick responses
  - [ ] Implement user blocking and reporting
  - [ ] Add chat moderation tools

### Phase 5: Testing, Documentation & Production
- [ ] **5.1 Comprehensive Testing**
  - [ ] Set up visual regression testing with Angular testing utilities
  - [ ] Implement WebSocket testing strategies with RxJS testing
  - [ ] Add accessibility testing automation with Angular CDK a11y testing
  - [ ] Configure performance testing benchmarks with Angular CLI
  - [ ] Set up cross-browser testing with Cypress/Playwright
  - [ ] Implement unit tests for all components and services
  - [ ] Add integration tests for NgRx store and effects
  - [ ] Create E2E tests for critical user journeys
- [ ] **5.2 Error Handling & Recovery**
  - [ ] Implement global error handling with Angular ErrorHandler
  - [ ] Add WebSocket error recovery with RxJS error operators
  - [ ] Configure GraphQL error handling with Apollo Angular
  - [ ] Set up error reporting system with Angular
  - [ ] Add user-friendly error messages with Angular Material snackbar
  - [ ] Implement retry mechanisms for failed operations
  - [ ] Create error boundary components for graceful degradation
  - [ ] Set up error analytics and monitoring
- [ ] **5.3 Documentation & Developer Experience**
  - [ ] Set up Storybook for Angular component documentation
  - [ ] Create API documentation with Compodoc
  - [ ] Add deployment and troubleshooting guides
  - [ ] Implement developer onboarding documentation
  - [ ] Configure development tools and debugging with Angular DevTools
  - [ ] Create component usage examples and guidelines
  - [ ] Set up automated documentation generation
  - [ ] Add code style guides and best practices
- [ ] **5.4 Production Deployment**
  - [ ] Configure production build optimization with Angular CLI
  - [ ] Set up CDN and asset optimization
  - [ ] Implement scaling considerations for Angular
  - [ ] Add monitoring and analytics with Angular
  - [ ] Configure deployment automation with Angular CLI
  - [ ] Set up environment-specific configurations
  - [ ] Implement health checks and status monitoring
  - [ ] Configure backup and disaster recovery procedures

## Component Implementation Checklist

### Angular Material Base Components Setup
- [ ] **Core Angular Material Components**
  - [ ] MatButton (primary, secondary, destructive variants)
  - [ ] MatFormField with MatInput (text, email, password, search)
  - [ ] MatDialog (modal dialogs)
  - [ ] MatMenu (user menus, context menus)
  - [ ] MatAvatar (user profile images with fallbacks)
  - [ ] MatBadge (notification counts, status indicators)
  - [ ] MatCard (conversation items, user cards)
  - [ ] MatDivider (visual dividers)
  - [ ] MatScrollingModule (virtual scrolling for chat messages)
  - [ ] MatSnackBar (notifications and alerts)
  - [ ] MatTooltip (helpful information on hover)
  - [ ] MatProgressSpinner (loading indicators)
  - [ ] MatSidenav (navigation drawer)
  - [ ] MatToolbar (header and navigation)
  - [ ] MatList (conversation and contact lists)

### Authentication Components
- [ ] **LoginComponent**
  - [ ] Angular Material form with MatFormField and MatInput
  - [ ] Email/password validation using Angular reactive forms
  - [ ] Apollo Angular mutation integration with NgRx store
  - [ ] Error handling with MatSnackBar notifications
  - [ ] Loading states with MatProgressSpinner
  - [ ] Angular Router navigation
  - [ ] Remember me functionality with MatCheckbox
  - [ ] Password visibility toggle with MatIconButton
- [ ] **RegistrationComponent**
  - [ ] Multi-step form using Angular Material stepper
  - [ ] Password strength indicator with custom Angular component
  - [ ] Terms acceptance with MatCheckbox
  - [ ] Email verification flow
  - [ ] Form validation with Angular validators and custom validators
  - [ ] Profile picture upload with drag-and-drop
  - [ ] Username availability checking
  - [ ] Social registration options
- [ ] **PasswordResetComponent**
  - [ ] Email input with Angular Material validation
  - [ ] Reset token validation
  - [ ] New password form with confirmation
  - [ ] Success/error messaging with MatSnackBar
  - [ ] Password strength validation
  - [ ] Resend email functionality
- [ ] **OAuthButtonsComponent**
  - [ ] Google OAuth with custom MatButton styling
  - [ ] GitHub OAuth integration
  - [ ] Social login error handling
  - [ ] Loading states and feedback with Angular Material
  - [ ] Account linking functionality

### Layout Components
- [ ] **MainLayoutComponent**
  - [ ] Responsive design with Angular Flex Layout
  - [ ] Collapsible sidebar using MatSidenav
  - [ ] Header with user menu using MatMenu
  - [ ] Main content area with proper Angular Material spacing
  - [ ] Mobile-first responsive navigation with Angular CDK breakpoints
  - [ ] **Theme Color Management System**
    - [ ] Create Angular Material theming service with dynamic color switching
    - [ ] Implement primary, accent, and background color customization with CSS custom properties
    - [ ] Set up custom color palette creation with Material Design color generation
    - [ ] Add color palette persistence using NgRx store and localStorage
    - [ ] Configure theme color validation and fallback mechanisms
    - [ ] Implement real-time theme color preview with Angular Material components
  - [ ] **Theme Schema Management System**
    - [ ] Implement dark/light/auto theme mode switching with Angular CDK
    - [ ] Add system preference detection using MediaWatcher service for auto mode
    - [ ] Create theme persistence across browser sessions with NgRx effects
    - [ ] Set up theme synchronization across multiple browser tabs
    - [ ] Configure smooth theme transitions with Angular Animations
    - [ ] Add theme preference inheritance from user profile settings
  - [ ] **Layout Variant Management System**
    - [ ] Create multiple layout options (empty, classic, compact, dense, futuristic, thin)
    - [ ] Implement horizontal layouts (centered, enterprise, material, modern)
    - [ ] Add layout switching functionality with user preference storage in NgRx
    - [ ] Create responsive layout adjustments using Angular CDK BreakpointObserver
    - [ ] Set up layout persistence and restoration across sessions
    - [ ] Implement layout preview system with visual thumbnails
  - [ ] **Theme and Layout Control Interface**
    - [ ] Create settings drawer component with Angular Material drawer
    - [ ] Add theme color picker with Material Design color swatches
    - [ ] Implement scheme selector (auto/dark/light) with system preference indicators
    - [ ] Create layout gallery with interactive preview thumbnails
    - [ ] Add reset to defaults functionality with confirmation dialogs
    - [ ] Implement import/export theme configurations with JSON validation
- [ ] **SidebarComponent**
  - [ ] Navigation menu with MatList and MatListItem
  - [ ] Active route highlighting with Angular Router
  - [ ] Collapsible design using MatExpansionPanel
  - [ ] User status with MatAvatar and MatBadge
  - [ ] Conversation list with MatVirtualScrollViewport
  - [ ] Search functionality with MatFormField
  - [ ] Recent conversations section
  - [ ] Favorites and pinned chats
- [ ] **HeaderComponent**
  - [ ] User MatAvatar with MatMenu
  - [ ] Notification MatBadge indicators
  - [ ] Search MatFormField with MatAutocomplete
  - [ ] Theme toggle MatSlideToggle with Angular Material theming
  - [ ] Mobile menu trigger with MatIconButton
  - [ ] Connection status indicator
  - [ ] Settings and preferences access
  - [ ] Help and support links
- [ ] **Modal System**
  - [ ] MatDialog component for modals
  - [ ] MatBottomSheet for mobile slide-up panels
  - [ ] Backdrop click handling
  - [ ] Keyboard navigation (ESC key) with Angular CDK
  - [ ] Focus management and accessibility with Angular CDK a11y
  - [ ] Modal stacking and z-index management
  - [ ] Custom modal animations
  - [ ] Modal data passing and result handling
- [ ] **Notification System**
  - [ ] MatSnackBar component for notifications
  - [ ] Success/error/info variants with Angular Material theming
  - [ ] Auto-dismiss with configurable timing
  - [ ] Queue management for multiple notifications
  - [ ] Animation transitions with Angular Animations
  - [ ] Action buttons in notifications
  - [ ] Persistent notifications for important messages
  - [ ] Notification history and management

### Chat Components
- [ ] **ConversationListComponent**
  - [ ] MatVirtualScrollViewport for smooth scrolling
  - [ ] MatCard components for conversation items
  - [ ] Real-time updates via WebSocket + NgRx
  - [ ] MatBadge for unread message counts
  - [ ] MatFormField with MatAutocomplete for search functionality
  - [ ] Infinite scrolling for large conversation lists
  - [ ] Conversation sorting and filtering options
  - [ ] Drag-and-drop for conversation organization
- [ ] **ConversationItemComponent**
  - [ ] MatCard with hover effects using Angular Material elevation
  - [ ] MatAvatar with online status MatBadge
  - [ ] Last message preview with text truncation
  - [ ] Timestamp formatting with Angular DatePipe
  - [ ] Unread MatBadge with count
  - [ ] Active conversation highlighting with Angular Material theming
  - [ ] Context menu with MatMenu for conversation actions
  - [ ] Typing indicator integration
- [ ] **MessageThreadComponent**
  - [ ] MatVirtualScrollViewport with infinite scroll
  - [ ] Message grouping with MatDivider
  - [ ] Date separators using custom Angular components
  - [ ] Scroll to bottom MatFabButton with smooth animation
  - [ ] Loading states with MatProgressSpinner
  - [ ] Message selection and bulk actions
  - [ ] Jump to unread messages functionality
  - [ ] Message search within conversation
- [ ] **MessageBubbleComponent**
  - [ ] MatCard variants for sent/received messages with Angular Material theming
  - [ ] Rich text formatting support
  - [ ] File attachment preview with MatDialog
  - [ ] Message status indicators with MatIcon
  - [ ] Emoji reactions using MatMenu
  - [ ] Context menu with MatMenu
  - [ ] Message editing and deletion
  - [ ] Reply and forward functionality
- [ ] **MessageInputComponent**
  - [ ] MatFormField with auto-resize textarea
  - [ ] File upload with drag-and-drop zone using Angular CDK drag-drop
  - [ ] Emoji picker using MatMenu with custom emoji component
  - [ ] Send MatButton with loading state
  - [ ] Keyboard shortcuts (Ctrl+Enter) with Angular CDK
  - [ ] Mention suggestions with MatAutocomplete
  - [ ] Message formatting toolbar
  - [ ] Voice message recording interface
- [ ] **TypingIndicatorComponent**
  - [ ] Animated dots indicator with Angular Animations
  - [ ] Multiple users typing display
  - [ ] Real-time WebSocket integration with RxJS
  - [ ] Smooth enter/exit animations with Angular Animations
  - [ ] Customizable typing indicator styles
  - [ ] Performance optimization for multiple indicators
- [ ] **ReadReceiptComponent**
  - [ ] Message delivery status MatIcon
  - [ ] Read by MatAvatar stack
  - [ ] MatTooltip with timestamp details
  - [ ] Status MatBadge variants
  - [ ] Bulk read status for multiple messages
  - [ ] Privacy settings integration

### User Components
- [ ] **UserProfileComponent**
  - [ ] Profile information display with Angular Material cards
  - [ ] Edit mode toggle with MatSlideToggle
  - [ ] Avatar upload functionality with Angular Material file input
  - [ ] Status message editing with MatFormField
  - [ ] Social links and contact information
  - [ ] Privacy settings management
  - [ ] Profile completion progress indicator
  - [ ] Activity status and last seen information
- [ ] **UserAvatarComponent**
  - [ ] Image display with fallback using MatAvatar
  - [ ] Online status indicator with MatBadge
  - [ ] Size variants for different contexts
  - [ ] Click handling for profile view
  - [ ] Lazy loading for performance
  - [ ] Custom avatar generation for users without photos
- [ ] **UserSettingsComponent**
  - [ ] Notification preferences with MatSlideToggle
  - [ ] Privacy settings with MatRadioGroup
  - [ ] Theme preferences with MatButtonToggleGroup
  - [ ] Account management with Angular Material forms
  - [ ] Language and localization settings
  - [ ] Data export and account deletion options
  - [ ] Security settings and two-factor authentication
  - [ ] Chat backup and sync preferences
- [ ] **UserSearchComponent**
  - [ ] Debounced search input with MatAutocomplete
  - [ ] Search results display with MatList
  - [ ] User selection handling
  - [ ] Recent searches with MatChipList
  - [ ] Advanced search filters
  - [ ] Search history management
- [ ] **ContactListComponent**
  - [ ] Alphabetical sorting with Angular pipes
  - [ ] Online status filtering with MatSelectFilter
  - [ ] Contact actions (message, call) with MatMenu
  - [ ] Add/remove contact functionality with MatDialog
  - [ ] Contact groups and categories
  - [ ] Import/export contact functionality
  - [ ] Contact synchronization with external services
  - [ ] Bulk contact management actions

## Configuration Files

### Package Configuration
- [ ] **package.json**
  ```json
  {
    "name": "chat-app-angular",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "ng": "ng",
      "start": "ng serve",
      "build": "ng build",
      "watch": "ng build --watch --configuration development",
      "test": "ng test",
      "test:watch": "ng test --watch",
      "test:e2e": "cypress run",
      "test:e2e:open": "cypress open",
      "lint": "ng lint",
      "type-check": "tsc --noEmit",
      "codegen": "graphql-codegen --config codegen.yml",
      "analyze": "ng build --stats-json && npx webpack-bundle-analyzer dist/chat/stats.json",
      "storybook": "ng run chat:storybook",
      "build-storybook": "ng run chat:build-storybook"
    },
    "dependencies": {
      "@angular/animations": "^20.0.0",
      "@angular/cdk": "^20.0.0",
      "@angular/common": "^20.0.0",
      "@angular/compiler": "^20.0.0",
      "@angular/core": "^20.0.0",
      "@angular/forms": "^20.0.0",
      "@angular/material": "^20.0.0",
      "@angular/platform-browser": "^20.0.0",
      "@angular/platform-browser-dynamic": "^20.0.0",
      "@angular/router": "^20.0.0",
      "@angular/service-worker": "^20.0.0",
      "apollo-angular": "^8.0.0",
      "@apollo/client": "^3.8.0",
      "graphql": "^16.8.0",
      "@ngrx/store": "^18.0.0",
      "@ngrx/effects": "^18.0.0",
      "@ngrx/component-store": "^18.0.0",
      "@ngrx/store-devtools": "^18.0.0",
      "rxjs": "~7.8.0",
      "tslib": "^2.3.0",
      "tailwindcss": "^3.4.0",
      "lucide-angular": "^0.300.0",
      "dompurify": "^3.0.0",
      "@types/dompurify": "^3.0.0"
    },
    "devDependencies": {
      "@angular/build": "^20.0.2",
      "@angular/cli": "^20.0.2",
      "@angular/compiler-cli": "^20.0.0",
      "@types/jasmine": "~5.1.0",
      "jasmine-core": "~5.7.0",
      "karma": "~6.4.0",
      "karma-chrome-launcher": "~3.2.0",
      "karma-coverage": "~2.2.0",
      "karma-jasmine": "~5.1.0",
      "karma-jasmine-html-reporter": "~2.1.0",
      "typescript": "~5.8.2",
      "@graphql-codegen/cli": "^5.0.0",
      "@graphql-codegen/typescript": "^4.0.0",
      "@graphql-codegen/typescript-operations": "^4.0.0",
      "@graphql-codegen/typescript-apollo-angular": "^4.0.0",
      "cypress": "^13.0.0",
      "@cypress/schematic": "^2.5.0",
      "eslint": "^8.57.0",
      "@angular-eslint/builder": "^18.0.0",
      "@angular-eslint/eslint-plugin": "^18.0.0",
      "@angular-eslint/eslint-plugin-template": "^18.0.0",
      "@angular-eslint/schematics": "^18.0.0",
      "@angular-eslint/template-parser": "^18.0.0",
      "@typescript-eslint/eslint-plugin": "^7.0.0",
      "@typescript-eslint/parser": "^7.0.0",
      "prettier": "^3.0.0",
      "autoprefixer": "^10.4.0",
      "postcss": "^8.4.0",
      "@storybook/angular": "^7.0.0",
      "@storybook/addon-essentials": "^7.0.0"
    }
  }
  ```

### Angular Configuration
- [ ] **angular.json**
  ```json
  {
    "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
    "version": 1,
    "newProjectRoot": "projects",
    "projects": {
      "chat": {
        "projectType": "application",
        "schematics": {
          "@schematics/angular:component": {
            "style": "css",
            "standalone": true
          },
          "@schematics/angular:directive": {
            "standalone": true
          },
          "@schematics/angular:pipe": {
            "standalone": true
          }
        },
        "root": "projects/chat",
        "sourceRoot": "projects/chat/src",
        "prefix": "app",
        "architect": {
          "build": {
            "builder": "@angular/build:application",
            "options": {
              "outputPath": "dist/chat",
              "index": "projects/chat/src/index.html",
              "browser": "projects/chat/src/main.ts",
              "polyfills": [],
              "tsConfig": "projects/chat/tsconfig.app.json",
              "assets": [
                "projects/chat/src/favicon.ico",
                "projects/chat/src/assets",
                "projects/chat/src/manifest.json"
              ],
              "styles": [
                "@angular/material/prebuilt-themes/azure-blue.css",
                "projects/chat/src/styles.css"
              ],
              "scripts": [],
              "serviceWorker": "projects/chat/src/ngsw-worker.js",
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ]
            },
            "configurations": {
              "production": {
                "optimization": true,
                "outputHashing": "all",
                "sourceMap": false,
                "namedChunks": false,
                "aot": true,
                "extractLicenses": true,
                "vendorChunk": false,
                "buildOptimizer": true
              },
              "development": {
                "optimization": false,
                "extractLicenses": false,
                "sourceMap": true,
                "vendorChunk": true,
                "namedChunks": true
              }
            }
          },
          "serve": {
            "builder": "@angular/build:dev-server",
            "configurations": {
              "production": {
                "buildTarget": "chat:build:production"
              },
              "development": {
                "buildTarget": "chat:build:development"
              }
            },
            "defaultConfiguration": "development"
          },
          "test": {
            "builder": "@angular/build:karma",
            "options": {
              "polyfills": [],
              "tsConfig": "projects/chat/tsconfig.spec.json",
              "assets": [
                "projects/chat/src/favicon.ico",
                "projects/chat/src/assets"
              ],
              "styles": [
                "@angular/material/prebuilt-themes/azure-blue.css",
                "projects/chat/src/styles.css"
              ],
              "scripts": []
            }
          }
        }
      }
    }
  }
  ```

### GraphQL Code Generator Configuration
- [ ] **codegen.yml**
  ```yaml
  schema: 'http://localhost:4000/graphql'
  documents: 'projects/chat/src/app/**/*.graphql'
  generates:
    projects/chat/src/app/types/graphql.ts:
      plugins:
        - typescript
        - typescript-operations
        - typescript-apollo-angular
      config:
        withHooks: false
        withHOC: false
        withComponent: false
        apolloAngularVersion: 8
        addExplicitOverride: true
        strictScalars: true
        scalars:
          DateTime: string
          Upload: File
        namingConvention:
          typeNames: pascal-case#pascalCase
          enumValues: upper-case#upperCase
    projects/chat/src/app/types/introspection.json:
      plugins:
        - introspection
  hooks:
    afterAllFileWrite:
      - prettier --write
  ```

### Tailwind CSS Configuration
- [ ] **tailwind.config.js**
  ```javascript
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./projects/chat/src/**/*.{html,ts}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: 'rgb(var(--color-primary-50) / <alpha-value>)',
            100: 'rgb(var(--color-primary-100) / <alpha-value>)',
            200: 'rgb(var(--color-primary-200) / <alpha-value>)',
            300: 'rgb(var(--color-primary-300) / <alpha-value>)',
            400: 'rgb(var(--color-primary-400) / <alpha-value>)',
            500: 'rgb(var(--color-primary-500) / <alpha-value>)',
            600: 'rgb(var(--color-primary-600) / <alpha-value>)',
            700: 'rgb(var(--color-primary-700) / <alpha-value>)',
            800: 'rgb(var(--color-primary-800) / <alpha-value>)',
            900: 'rgb(var(--color-primary-900) / <alpha-value>)',
          },
          accent: {
            50: 'rgb(var(--color-accent-50) / <alpha-value>)',
            500: 'rgb(var(--color-accent-500) / <alpha-value>)',
            900: 'rgb(var(--color-accent-900) / <alpha-value>)',
          }
        },
        fontFamily: {
          sans: ['Roboto', 'sans-serif'],
          mono: ['Roboto Mono', 'monospace'],
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(100%)' },
            '100%': { transform: 'translateY(0)' },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('@tailwindcss/forms'),
    ],
  }
  ```

## Development Workflow

### Angular Development Commands
```bash
# Navigate to Angular directory
cd client/web/angular

# Install dependencies
pnpm install

# Start development server
pnpm start
# or
ng serve

# Build for production
pnpm build
# or
ng build

# Run unit tests
pnpm test
# or
ng test

# Run E2E tests
pnpm test:e2e
# or
cypress run

# Generate GraphQL types
pnpm codegen
# or
graphql-codegen --config codegen.yml

# Lint code
pnpm lint
# or
ng lint

# Type check
pnpm type-check
# or
tsc --noEmit

# Analyze bundle size
pnpm analyze

# Run Storybook
pnpm storybook
```

### Angular CLI Commands
```bash
# Generate new component
ng generate component features/chat/components/message-bubble --standalone

# Generate new service
ng generate service core/services/websocket

# Generate new guard
ng generate guard core/guards/auth

# Generate new pipe
ng generate pipe shared/pipes/time-ago --standalone

# Generate new directive
ng generate directive shared/directives/auto-focus --standalone

# Add Angular Material component
ng add @angular/material

# Add PWA support
ng add @angular/pwa

# Add service worker
ng add @angular/service-worker

# Generate NgRx feature
ng generate @ngrx/schematics:feature chat --module app.module.ts

# Generate NgRx effects
ng generate @ngrx/schematics:effect chat/Chat --module app.module.ts
```

## Integration Patterns

### Angular GraphQL Integration
- **Schema Management**: Independent schema download from Federation Gateway
- **Type Generation**: GraphQL Code Generator with Angular-specific templates
- **Apollo Angular**: Angular service-based GraphQL client with RxJS observables
- **Query Optimization**: Angular-specific caching and subscription strategies
- **Error Handling**: Angular ErrorHandler integration with GraphQL errors

### Angular WebSocket Integration
- **Connection Management**: Angular service-based WebSocket connection handling
- **Subscription Handling**: RxJS observables for real-time updates
- **State Synchronization**: WebSocket state sync with NgRx store
- **Error Recovery**: RxJS-based reconnection logic with exponential backoff

### Angular Authentication Integration
- **Token Management**: Angular HTTP interceptors for JWT handling
- **Route Protection**: Angular Guards for protected routes
- **State Management**: NgRx store for authentication state
- **Security**: Angular HTTP client CSRF protection and secure cookie handling

## Performance Considerations

### Angular Performance Optimization
- **OnPush Change Detection**: Optimize change detection with OnPush strategy
- **Standalone Components**: Reduce bundle size with standalone components
- **Lazy Loading**: Angular Router lazy loading for feature modules
- **Virtual Scrolling**: Angular CDK virtual scrolling for large lists
- **TrackBy Functions**: Optimize *ngFor with trackBy functions

### Bundle Optimization
- **Tree Shaking**: Angular CLI automatic tree shaking
- **Code Splitting**: Angular Router-based code splitting
- **Bundle Analysis**: Angular CLI bundle analyzer for optimization
- **Preloading**: Angular Router preloading strategies

### Real-time Performance
- **RxJS Operators**: Efficient observable operators for WebSocket handling
- **NgRx Selectors**: Memoized selectors for state management
- **Angular Signals**: Modern reactive programming for better performance
- **Change Detection**: Optimized change detection with OnPush and signals

## Testing Strategy

### Angular Testing Approach
- [ ] **Unit Testing**
  - [ ] Jasmine and Karma configuration for Angular
  - [ ] Angular Testing Library for component tests
  - [ ] Mock GraphQL operations and WebSocket connections
  - [ ] Custom test utilities for Angular-specific features
- [ ] **Integration Testing**
  - [ ] Apollo Angular integration tests with RxJS testing
  - [ ] WebSocket connection testing with RxJS marble testing
  - [ ] Authentication flow testing with Angular testing utilities
  - [ ] NgRx store testing with store testing utilities
- [ ] **End-to-End Testing**
  - [ ] Cypress for modern E2E testing with Angular
  - [ ] Real-time feature testing with WebSocket mocking
  - [ ] Mobile responsiveness testing with Angular CDK breakpoints
  - [ ] Angular-specific routing and navigation tests
- [ ] **Performance Testing**
  - [ ] Bundle size monitoring with Angular CLI
  - [ ] Core Web Vitals tracking with Angular performance APIs
  - [ ] GraphQL query performance with Apollo Angular DevTools
  - [ ] WebSocket connection performance with RxJS performance testing

### Angular Testing Commands
```bash
# Navigate to Angular directory
cd client/web/angular

# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Open Cypress test runner
pnpm test:e2e:open

# Generate coverage report
ng test --code-coverage

# Run specific test suite
ng test --include="**/auth/**/*.spec.ts"

# Run tests with specific configuration
ng test --configuration=ci
```

## Implementation Strategy

### Angular Development Phases
1. **Phase 1**: Complete Angular workspace setup and configuration
2. **Phase 2**: Implement core authentication and user management features
3. **Phase 3**: Build chat interface with real-time WebSocket integration
4. **Phase 4**: Add advanced features, PWA support, and performance optimization
5. **Phase 5**: Comprehensive testing, documentation, and production deployment

### Angular-Specific Benefits
- **Type Safety**: Full TypeScript integration with Angular's dependency injection
- **Reactive Programming**: RxJS observables for handling asynchronous operations
- **Component Architecture**: Standalone components for better tree shaking
- **Material Design**: Angular Material for consistent UI/UX
- **Performance**: OnPush change detection and Angular Signals for optimization
- **Testing**: Comprehensive testing utilities and Angular testing framework
- **PWA Support**: Built-in service worker and PWA capabilities
- **Accessibility**: Angular CDK a11y for comprehensive accessibility support

This Angular implementation provides a modern, performant, and maintainable chat application that integrates seamlessly with the existing NestJS microservice architecture while following Angular best practices and patterns.
