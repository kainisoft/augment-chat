# Design Document

## Overview

This design document outlines the technical architecture and implementation approach for creating a multi-project Angular V2 workspace. The design focuses on establishing a modern, scalable foundation that supports the 8-phase implementation plan while incorporating cutting-edge Angular features, performance optimizations, and enterprise-grade capabilities.

The workspace will be structured as a monorepo with multiple applications and shared libraries, leveraging Angular's latest features including Signals, Standalone Components, and advanced build optimizations.

## Architecture

### Workspace Structure

The Angular V2 workspace will follow a hierarchical structure optimized for scalability and maintainability:

```
client/web/angularV2/
├── angular.json                 # Workspace configuration
├── package.json                 # Root dependencies and scripts
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── tsconfig.json               # Root TypeScript configuration
├── nx.json                     # Nx configuration for build optimization
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── webpack.config.js           # Custom webpack configuration
├── projects/
│   ├── chat-app/               # Main chat application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/       # Core services and guards
│   │   │   │   ├── features/   # Feature modules
│   │   │   │   ├── shared/     # Shared components
│   │   │   │   └── app.config.ts
│   │   │   ├── assets/
│   │   │   ├── environments/
│   │   │   └── main.ts
│   │   ├── project.json
│   │   └── tsconfig.app.json
│   ├── admin-panel/            # Admin application
│   ├── mobile-shell/           # Mobile-optimized shell
│   └── shared-lib/             # Shared library
│       ├── src/
│       │   ├── lib/
│       │   │   ├── components/ # Reusable components
│       │   │   ├── services/   # Shared services
│       │   │   ├── models/     # Data models
│       │   │   ├── utils/      # Utility functions
│       │   │   └── index.ts
│       │   └── public-api.ts
│       ├── project.json
│       └── tsconfig.lib.json
├── tools/
│   ├── scripts/                # Build and deployment scripts
│   ├── generators/             # Code generators
│   └── webpack/                # Custom webpack configurations
├── docs/
│   ├── architecture/           # Architecture documentation
│   ├── api/                    # API documentation
│   └── development/            # Development guidelines
└── .github/
    └── workflows/              # CI/CD pipelines
```

### Technology Stack Integration

#### Core Framework Configuration
- **Angular 20+**: Latest version with full Standalone Components and Signals support
- **TypeScript 5.8+**: Strict mode with advanced type checking and decorators
- **Nx**: Monorepo tooling for build optimization and code generation
- **pnpm**: Package manager with workspace support and efficient dependency management

#### Build and Development Tools
- **Webpack 5**: Module Federation support for micro-frontend architecture
- **Vite**: Alternative build tool for faster development builds
- **ESBuild**: Fast TypeScript compilation and bundling
- **SWC**: Rust-based JavaScript/TypeScript compiler for performance

#### UI and Styling Framework
- **Tailwind CSS 4.0+**: Utility-first CSS framework with JIT compilation and advanced theming plugin
- **Angular Material 20+**: Component library with custom design system integration
- **Angular CDK**: Component development kit for advanced UI patterns
- **CSS Custom Properties**: Dynamic theming and design token system with runtime switching
- **Fuse Theming System**: Advanced multi-theme architecture with palette generation and contrast calculation

## Components and Interfaces

### Core Application Architecture

#### 1. Main Chat Application (`projects/chat-app`)

**Application Bootstrap Configuration:**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: '/graphql' }),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: { errorPolicy: 'all' },
        },
      };
    }),
    provideStore(rootReducer),
    provideEffects([ChatEffects, UserEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    // Custom providers
    provideSignalStore(),
    provideWebSocketConnection(),
    provideAIServices(),
  ],
};
```

**Feature Module Structure:**
```typescript
// Core feature structure with signals
export interface ChatFeatureState {
  messages: Signal<Message[]>;
  activeConversation: Signal<Conversation | null>;
  typingUsers: Signal<User[]>;
  connectionStatus: Signal<ConnectionStatus>;
}

// Signal-based service
@Injectable({ providedIn: 'root' })
export class ChatSignalService {
  private state = signalStore({
    messages: signal<Message[]>([]),
    activeConversation: signal<Conversation | null>(null),
    typingUsers: signal<User[]>([]),
    connectionStatus: signal<ConnectionStatus>('disconnected'),
  });

  // Computed signals
  readonly sortedMessages = computed(() => 
    this.state.messages().sort((a, b) => a.timestamp - b.timestamp)
  );
  
  readonly unreadCount = computed(() => 
    this.state.messages().filter(m => !m.read).length
  );
}
```

#### 2. Shared Library (`projects/shared-lib`)

**Component Architecture:**
```typescript
// Base component with signals
@Component({
  selector: 'lib-base-component',
  standalone: true,
  templateUrl: './base.component.html',
  styleUrl: './base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class BaseComponent {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly cdr = inject(ChangeDetectorRef);
  
  // Signal-based loading state
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  
  // Utility methods
  protected setLoading(loading: boolean) {
    this.loading.set(loading);
  }
  
  protected setError(error: string | null) {
    this.error.set(error);
  }
}

// Reusable message component
@Component({
  selector: 'lib-message-bubble',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBubbleComponent extends BaseComponent {
  message = input.required<Message>();
  currentUserId = input.required<string>();
  
  protected isSent = computed(() => 
    this.message().senderId === this.currentUserId()
  );
  
  protected formattedTime = computed(() => 
    formatDistanceToNow(this.message().timestamp)
  );
}
```

### State Management Architecture

#### Signal Store Integration
```typescript
// Global signal store
export const globalStore = signalStore(
  { providedIn: 'root' },
  withState({
    user: null as User | null,
    theme: 'light' as Theme,
    notifications: [] as Notification[],
    connectionStatus: 'disconnected' as ConnectionStatus,
  }),
  withComputed(({ user, notifications }) => ({
    isAuthenticated: computed(() => !!user()),
    unreadNotifications: computed(() => 
      notifications().filter(n => !n.read).length
    ),
  })),
  withMethods((store) => ({
    setUser: (user: User | null) => patchState(store, { user }),
    setTheme: (theme: Theme) => patchState(store, { theme }),
    addNotification: (notification: Notification) => 
      patchState(store, { 
        notifications: [...store.notifications(), notification] 
      }),
  }))
);
```

#### GraphQL Integration
```typescript
// GraphQL service with Apollo
@Injectable({ providedIn: 'root' })
export class GraphQLService {
  private apollo = inject(Apollo);
  
  // Query with signals
  getMessages(conversationId: string) {
    return toSignal(
      this.apollo.watchQuery<{ messages: Message[] }>({
        query: GET_MESSAGES,
        variables: { conversationId },
        pollInterval: 1000,
      }).valueChanges.pipe(
        map(result => result.data.messages)
      ),
      { initialValue: [] }
    );
  }
  
  // Mutation with optimistic updates
  sendMessage(message: CreateMessageInput) {
    return this.apollo.mutate<{ sendMessage: Message }>({
      mutation: SEND_MESSAGE,
      variables: { input: message },
      optimisticResponse: {
        sendMessage: {
          ...message,
          id: generateTempId(),
          timestamp: Date.now(),
          status: 'sending',
        },
      },
      update: (cache, { data }) => {
        if (data?.sendMessage) {
          this.updateMessageCache(cache, data.sendMessage);
        }
      },
    });
  }
}
```

### Micro-frontend Architecture

#### Module Federation Configuration
```typescript
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'chat-app',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatModule': './src/app/features/chat/chat.module.ts',
        './SharedComponents': './src/app/shared/components/index.ts',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
        'rxjs': { singleton: true, strictVersion: true },
      },
    }),
  ],
};

// Dynamic module loading
@Injectable({ providedIn: 'root' })
export class ModuleFederationService {
  async loadRemoteModule(remoteName: string, exposedModule: string) {
    const container = await loadRemoteContainer(remoteName);
    const factory = await container.get(exposedModule);
    return factory();
  }
  
  async loadChatFeature() {
    return this.loadRemoteModule('chat-features', './AdvancedChat');
  }
}
```

## Data Models

### Core Data Structures

```typescript
// User model with signals
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  lastSeen: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

// Message model with metadata
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: number;
  status: MessageStatus;
  metadata?: MessageMetadata;
  reactions?: Reaction[];
  replies?: Message[];
}

export interface MessageMetadata {
  aiSuggested?: boolean;
  edited?: boolean;
  editHistory?: EditHistory[];
  mentions?: string[];
  attachments?: Attachment[];
  encryption?: EncryptionInfo;
}

// Conversation model
export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  participants: string[];
  name?: string;
  description?: string;
  avatar?: string;
  settings: ConversationSettings;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}

// Real-time event models
export interface WebSocketEvent {
  type: EventType;
  payload: unknown;
  timestamp: number;
  userId?: string;
  conversationId?: string;
}

export type EventType = 
  | 'message:new'
  | 'message:update'
  | 'message:delete'
  | 'user:typing'
  | 'user:presence'
  | 'conversation:update';
```

### State Management Models

```typescript
// Application state structure
export interface AppState {
  auth: AuthState;
  chat: ChatState;
  ui: UIState;
  notifications: NotificationState;
  settings: SettingsState;
}

export interface ChatState {
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>;
  connectionStatus: ConnectionStatus;
  messageCache: MessageCache;
}

// Signal-based state slices
export interface SignalState {
  user: WritableSignal<User | null>;
  conversations: WritableSignal<Conversation[]>;
  activeConversation: WritableSignal<Conversation | null>;
  messages: WritableSignal<Message[]>;
  typingUsers: WritableSignal<User[]>;
  connectionStatus: WritableSignal<ConnectionStatus>;
}
```

## Error Handling

### Comprehensive Error Management

```typescript
// Global error handler
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggingService);
  private notification = inject(NotificationService);
  
  handleError(error: Error): void {
    console.error('Global error:', error);
    
    // Log error with context
    this.logger.error('Unhandled error', {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
    
    // Show user-friendly notification
    this.notification.showError(
      'An unexpected error occurred. Please try again.'
    );
    
    // Report to monitoring service
    this.reportError(error);
  }
  
  private reportError(error: Error) {
    // Integration with error monitoring service
    // (Sentry, LogRocket, etc.)
  }
}

// HTTP error interceptor
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorHandler = inject(ErrorHandlerService);
      return errorHandler.handleHttpError(error);
    })
  );
};

// WebSocket error handling
@Injectable({ providedIn: 'root' })
export class WebSocketErrorHandler {
  handleConnectionError(error: Event) {
    console.error('WebSocket connection error:', error);
    
    // Implement reconnection logic
    this.scheduleReconnection();
  }
  
  handleMessageError(error: MessageEvent) {
    console.error('WebSocket message error:', error);
    
    // Handle specific message errors
    this.processMessageError(error);
  }
  
  private scheduleReconnection() {
    // Exponential backoff reconnection strategy
  }
}
```

### Validation and Data Integrity

```typescript
// Input validation service
@Injectable({ providedIn: 'root' })
export class ValidationService {
  validateMessage(content: string): ValidationResult {
    const errors: string[] = [];
    
    if (!content.trim()) {
      errors.push('Message cannot be empty');
    }
    
    if (content.length > 5000) {
      errors.push('Message too long (max 5000 characters)');
    }
    
    // Content filtering
    if (this.containsInappropriateContent(content)) {
      errors.push('Message contains inappropriate content');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  validateUser(user: Partial<User>): ValidationResult {
    const errors: string[] = [];
    
    if (!user.username || user.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (!user.email || !this.isValidEmail(user.email)) {
      errors.push('Valid email is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

## Testing Strategy

### Comprehensive Testing Architecture

```typescript
// Component testing with signals
describe('MessageBubbleComponent', () => {
  let component: MessageBubbleComponent;
  let fixture: ComponentFixture<MessageBubbleComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBubbleComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
      ],
    }).compileComponents();
    
    fixture = TestBed.createComponent(MessageBubbleComponent);
    component = fixture.componentInstance;
  });
  
  it('should display message content correctly', () => {
    const mockMessage = signal({
      id: '1',
      content: 'Test message',
      senderId: 'user1',
      timestamp: Date.now(),
    });
    
    fixture.componentRef.setInput('message', mockMessage());
    fixture.componentRef.setInput('currentUserId', 'user1');
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('Test message');
    expect(component.isSent()).toBe(true);
  });
});

// Service testing with signals
describe('ChatSignalService', () => {
  let service: ChatSignalService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSignalService);
  });
  
  it('should update messages signal', () => {
    const testMessages = [
      { id: '1', content: 'Hello', timestamp: 1 },
      { id: '2', content: 'World', timestamp: 2 },
    ];
    
    service.setMessages(testMessages);
    
    expect(service.messages()).toEqual(testMessages);
    expect(service.sortedMessages()).toEqual(testMessages);
  });
});

// E2E testing configuration
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: true,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
```

### Performance Testing

```typescript
// Performance monitoring service
@Injectable({ providedIn: 'root' })
export class PerformanceMonitoringService {
  private observer: PerformanceObserver;
  
  constructor() {
    this.initializeObserver();
  }
  
  private initializeObserver() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processPerformanceEntry(entry);
      }
    });
    
    this.observer.observe({ 
      entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] 
    });
  }
  
  measureComponentRender(componentName: string) {
    performance.mark(`${componentName}-start`);
    
    return () => {
      performance.mark(`${componentName}-end`);
      performance.measure(
        `${componentName}-render`,
        `${componentName}-start`,
        `${componentName}-end`
      );
    };
  }
}
```

## Security Implementation

### Authentication and Authorization

```typescript
// JWT service with secure storage
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  
  constructor(
    private http: HttpClient,
    private secureStorage: SecureStorageService
  ) {
    this.loadTokensFromStorage();
  }
  
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.storeTokens(response.accessToken, response.refreshToken);
      }),
      catchError(this.handleAuthError)
    );
  }
  
  private storeTokens(accessToken: string, refreshToken: string) {
    this.secureStorage.setItem('access_token', accessToken);
    this.secureStorage.setItem('refresh_token', refreshToken);
    this.tokenSubject.next(accessToken);
    this.refreshTokenSubject.next(refreshToken);
  }
  
  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.logout();
    }
    return throwError(() => error);
  }
}

// Security headers configuration
export const securityInterceptor: HttpInterceptorFn = (req, next) => {
  const secureReq = req.clone({
    setHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
  });
  
  return next(secureReq);
};
```

### Content Security Policy

```typescript
// CSP configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'wss:', 'https:'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
};
```

## Performance Optimization

### Bundle Optimization Strategy

```typescript
// Lazy loading configuration
const routes: Routes = [
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard],
  },
];

// Preloading strategy
@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload based on user behavior and route priority
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}
```

### Memory Management

```typescript
// Memory optimization service
@Injectable({ providedIn: 'root' })
export class MemoryOptimizationService {
  private componentCache = new Map<string, WeakRef<any>>();
  private subscriptionTracker = new Set<Subscription>();
  
  trackComponent(id: string, component: any) {
    this.componentCache.set(id, new WeakRef(component));
  }
  
  trackSubscription(subscription: Subscription) {
    this.subscriptionTracker.add(subscription);
  }
  
  cleanup() {
    // Clean up weak references
    for (const [key, ref] of this.componentCache) {
      if (!ref.deref()) {
        this.componentCache.delete(key);
      }
    }
    
    // Unsubscribe from tracked subscriptions
    this.subscriptionTracker.forEach(sub => sub.unsubscribe());
    this.subscriptionTracker.clear();
  }
}
```

## Multi-Theme Architecture

### Advanced Theming System

The Angular V2 workspace will implement a sophisticated multi-theme system based on the Fuse framework architecture, allowing users to switch between different color palettes and design schemes dynamically.

#### Theme Configuration Structure

```typescript
// Theme configuration interface
export interface ThemeConfig {
  name: string;
  displayName: string;
  primary: ColorPalette;
  accent: ColorPalette;
  warn: ColorPalette;
  background: BackgroundPalette;
  foreground: ForegroundPalette;
  isDark: boolean;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  DEFAULT: string;
  contrast: ContrastPalette;
}

export interface BackgroundPalette {
  'bg-app-bar': string;
  'bg-card': string;
  'bg-default': string;
  'bg-dialog': string;
  'bg-hover': string;
  'bg-status-bar': string;
}

export interface ForegroundPalette {
  'text-default': string;
  'text-secondary': string;
  'text-hint': string;
  'text-disabled': string;
  border: string;
  divider: string;
  icon: string;
  'mat-icon': string;
}
```

#### Predefined Theme Configurations

```typescript
// themes.config.ts
export const THEME_CONFIGURATIONS: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: 'Default Blue',
    primary: generatePalette('#2196F3'),
    accent: generatePalette('#607D8B'),
    warn: generatePalette('#F44336'),
    isDark: false,
  },
  indigo: {
    name: 'indigo',
    displayName: 'Indigo',
    primary: generatePalette('#3F51B5'),
    accent: generatePalette('#FF4081'),
    warn: generatePalette('#F44336'),
    isDark: false,
  },
  teal: {
    name: 'teal',
    displayName: 'Teal',
    primary: generatePalette('#009688'),
    accent: generatePalette('#FFC107'),
    warn: generatePalette('#F44336'),
    isDark: false,
  },
  purple: {
    name: 'purple',
    displayName: 'Purple',
    primary: generatePalette('#9C27B0'),
    accent: generatePalette('#4CAF50'),
    warn: generatePalette('#F44336'),
    isDark: false,
  },
  amber: {
    name: 'amber',
    displayName: 'Amber',
    primary: generatePalette('#FFC107'),
    accent: generatePalette('#607D8B'),
    warn: generatePalette('#F44336'),
    isDark: false,
  },
  rose: {
    name: 'rose',
    displayName: 'Rose',
    primary: generatePalette('#E91E63'),
    accent: generatePalette('#00BCD4'),
    warn: generatePalette('#F44336'),
    isDark: false,
  },
  // Dark theme variants
  'default-dark': {
    name: 'default-dark',
    displayName: 'Default Blue Dark',
    primary: generatePalette('#2196F3'),
    accent: generatePalette('#607D8B'),
    warn: generatePalette('#F44336'),
    isDark: true,
  },
  'indigo-dark': {
    name: 'indigo-dark',
    displayName: 'Indigo Dark',
    primary: generatePalette('#3F51B5'),
    accent: generatePalette('#FF4081'),
    warn: generatePalette('#F44336'),
    isDark: true,
  },
  // Custom brand themes
  brand: {
    name: 'brand',
    displayName: 'Brand Theme',
    primary: generatePalette('#1976D2'),
    accent: generatePalette('#FF5722'),
    warn: generatePalette('#F44336'),
    isDark: false,
  },
};
```

#### Theme Service Implementation

```typescript
// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme = signal<ThemeConfig>(THEME_CONFIGURATIONS.default);
  private availableThemes = signal<ThemeConfig[]>(Object.values(THEME_CONFIGURATIONS));
  
  // Public signals
  readonly currentTheme$ = this.currentTheme.asReadonly();
  readonly availableThemes$ = this.availableThemes.asReadonly();
  readonly isDarkMode = computed(() => this.currentTheme().isDark);
  
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
    this.initializeTheme();
  }
  
  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('selected-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme && THEME_CONFIGURATIONS[savedTheme]) {
      this.setTheme(savedTheme);
    } else if (systemPrefersDark) {
      this.setTheme('default-dark');
    } else {
      this.setTheme('default');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('selected-theme')) {
        this.setTheme(e.matches ? 'default-dark' : 'default');
      }
    });
  }
  
  /**
   * Set the active theme
   */
  setTheme(themeName: string): void {
    const theme = THEME_CONFIGURATIONS[themeName];
    if (!theme) {
      console.warn(`Theme '${themeName}' not found`);
      return;
    }
    
    // Update current theme signal
    this.currentTheme.set(theme);
    
    // Apply theme classes to document body
    this.applyThemeClasses(theme);
    
    // Generate and inject CSS custom properties
    this.injectThemeProperties(theme);
    
    // Save to localStorage
    localStorage.setItem('selected-theme', themeName);
    
    // Emit theme change event
    this.document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme, previousTheme: this.currentTheme() }
    }));
  }
  
  /**
   * Apply theme CSS classes to document body
   */
  private applyThemeClasses(theme: ThemeConfig): void {
    const body = this.document.body;
    
    // Remove existing theme classes
    const existingThemeClasses = Array.from(body.classList)
      .filter(className => className.startsWith('theme-'));
    existingThemeClasses.forEach(className => {
      this.renderer.removeClass(body, className);
    });
    
    // Add new theme classes
    this.renderer.addClass(body, `theme-${theme.name}`);
    this.renderer.addClass(body, theme.isDark ? 'dark' : 'light');
  }
  
  /**
   * Inject CSS custom properties for the theme
   */
  private injectThemeProperties(theme: ThemeConfig): void {
    const root = this.document.documentElement;
    
    // Generate CSS custom properties for all color palettes
    this.setCSSCustomProperties(root, theme.primary, 'primary');
    this.setCSSCustomProperties(root, theme.accent, 'accent');
    this.setCSSCustomProperties(root, theme.warn, 'warn');
    
    // Set background and foreground properties
    Object.entries(theme.background || {}).forEach(([key, value]) => {
      root.style.setProperty(`--fuse-${key}`, value);
      root.style.setProperty(`--fuse-${key}-rgb`, this.hexToRgb(value));
    });
    
    Object.entries(theme.foreground || {}).forEach(([key, value]) => {
      root.style.setProperty(`--fuse-${key}`, value);
      root.style.setProperty(`--fuse-${key}-rgb`, this.hexToRgb(value));
    });
  }
  
  /**
   * Set CSS custom properties for a color palette
   */
  private setCSSCustomProperties(element: HTMLElement, palette: ColorPalette, name: string): void {
    Object.entries(palette).forEach(([shade, color]) => {
      if (shade !== 'contrast' && typeof color === 'string') {
        element.style.setProperty(`--fuse-${name}-${shade}`, color);
        element.style.setProperty(`--fuse-${name}-${shade}-rgb`, this.hexToRgb(color));
      }
    });
    
    // Set contrast colors
    if (palette.contrast) {
      Object.entries(palette.contrast).forEach(([shade, color]) => {
        element.style.setProperty(`--fuse-on-${name}-${shade}`, color);
        element.style.setProperty(`--fuse-on-${name}-${shade}-rgb`, this.hexToRgb(color));
      });
    }
  }
  
  /**
   * Convert hex color to RGB values
   */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
  }
  
  /**
   * Toggle between light and dark variants of current theme
   */
  toggleDarkMode(): void {
    const currentTheme = this.currentTheme();
    const targetThemeName = currentTheme.isDark 
      ? currentTheme.name.replace('-dark', '')
      : `${currentTheme.name}-dark`;
    
    if (THEME_CONFIGURATIONS[targetThemeName]) {
      this.setTheme(targetThemeName);
    }
  }
  
  /**
   * Get theme by name
   */
  getTheme(themeName: string): ThemeConfig | undefined {
    return THEME_CONFIGURATIONS[themeName];
  }
  
  /**
   * Create custom theme
   */
  createCustomTheme(config: Partial<ThemeConfig> & { name: string }): void {
    const customTheme: ThemeConfig = {
      displayName: config.displayName || config.name,
      primary: config.primary || generatePalette('#2196F3'),
      accent: config.accent || generatePalette('#607D8B'),
      warn: config.warn || generatePalette('#F44336'),
      isDark: config.isDark || false,
      background: config.background || this.getDefaultBackground(config.isDark || false),
      foreground: config.foreground || this.getDefaultForeground(config.isDark || false),
      ...config,
    };
    
    THEME_CONFIGURATIONS[config.name] = customTheme;
    this.availableThemes.set(Object.values(THEME_CONFIGURATIONS));
  }
  
  private getDefaultBackground(isDark: boolean): BackgroundPalette {
    return isDark ? {
      'bg-app-bar': '#1e293b',
      'bg-card': '#334155',
      'bg-default': '#0f172a',
      'bg-dialog': '#334155',
      'bg-hover': 'rgba(255, 255, 255, 0.05)',
      'bg-status-bar': '#1e293b',
    } : {
      'bg-app-bar': '#ffffff',
      'bg-card': '#ffffff',
      'bg-default': '#f1f5f9',
      'bg-dialog': '#ffffff',
      'bg-hover': 'rgba(0, 0, 0, 0.04)',
      'bg-status-bar': '#e2e8f0',
    };
  }
  
  private getDefaultForeground(isDark: boolean): ForegroundPalette {
    return isDark ? {
      'text-default': '#ffffff',
      'text-secondary': '#94a3b8',
      'text-hint': '#64748b',
      'text-disabled': '#475569',
      border: 'rgba(255, 255, 255, 0.12)',
      divider: 'rgba(255, 255, 255, 0.12)',
      icon: '#94a3b8',
      'mat-icon': '#94a3b8',
    } : {
      'text-default': '#1e293b',
      'text-secondary': '#64748b',
      'text-hint': '#94a3b8',
      'text-disabled': '#cbd5e1',
      border: '#e2e8f0',
      divider: '#e2e8f0',
      icon: '#64748b',
      'mat-icon': '#64748b',
    };
  }
}
```

#### Theme Selector Component

```typescript
// theme-selector.component.ts
@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule, MatTooltipModule],
  template: `
    <button mat-icon-button 
            [matMenuTriggerFor]="themeMenu"
            matTooltip="Change Theme"
            class="theme-selector-button">
      <mat-icon>palette</mat-icon>
    </button>
    
    <mat-menu #themeMenu="matMenu" class="theme-menu">
      <div class="theme-menu-header">
        <h3>Choose Theme</h3>
        <button mat-icon-button 
                (click)="themeService.toggleDarkMode()"
                [matTooltip]="isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
      </div>
      
      <div class="theme-grid">
        @for (theme of availableThemes(); track theme.name) {
          <button mat-button
                  class="theme-option"
                  [class.active]="currentTheme().name === theme.name"
                  (click)="selectTheme(theme.name)">
            <div class="theme-preview">
              <div class="color-swatch primary" 
                   [style.background-color]="theme.primary.DEFAULT"></div>
              <div class="color-swatch accent" 
                   [style.background-color]="theme.accent.DEFAULT"></div>
              <div class="color-swatch warn" 
                   [style.background-color]="theme.warn.DEFAULT"></div>
            </div>
            <span class="theme-name">{{ theme.displayName }}</span>
          </button>
        }
      </div>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="openCustomThemeDialog()">
        <mat-icon>add</mat-icon>
        <span>Create Custom Theme</span>
      </button>
    </mat-menu>
  `,
  styleUrl: './theme-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSelectorComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly dialog = inject(MatDialog);
  
  protected readonly currentTheme = this.themeService.currentTheme$;
  protected readonly availableThemes = this.themeService.availableThemes$;
  protected readonly isDarkMode = this.themeService.isDarkMode;
  
  protected selectTheme(themeName: string): void {
    this.themeService.setTheme(themeName);
  }
  
  protected openCustomThemeDialog(): void {
    const dialogRef = this.dialog.open(CustomThemeDialogComponent, {
      width: '600px',
      data: { currentTheme: this.currentTheme() }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.themeService.createCustomTheme(result);
        this.themeService.setTheme(result.name);
      }
    });
  }
}
```

#### Tailwind Configuration Enhancement

```javascript
// tailwind.config.js
const path = require('path');
const colors = require('tailwindcss/colors');
const generatePalette = require('./src/@fuse/tailwind/utils/generate-palette');

const customPalettes = {
  brand: generatePalette('#1976D2'),
};

const themes = {
  default: {
    primary: {
      ...colors.blue,
      DEFAULT: colors.blue[600],
    },
    accent: {
      ...colors.blueGray,
      DEFAULT: colors.blueGray[800],
    },
    warn: {
      ...colors.red,
      DEFAULT: colors.red[600],
    },
  },
  indigo: {
    primary: {
      ...colors.indigo,
      DEFAULT: colors.indigo[600],
    },
    accent: {
      ...colors.pink,
      DEFAULT: colors.pink[400],
    },
  },
  teal: {
    primary: {
      ...colors.teal,
      DEFAULT: colors.teal[600],
    },
    accent: {
      ...colors.amber,
      DEFAULT: colors.amber[500],
    },
  },
  purple: {
    primary: {
      ...colors.purple,
      DEFAULT: colors.purple[600],
    },
    accent: {
      ...colors.green,
      DEFAULT: colors.green[500],
    },
  },
  amber: {
    primary: {
      ...colors.amber,
      DEFAULT: colors.amber[500],
    },
  },
  rose: {
    primary: {
      ...colors.rose,
      DEFAULT: colors.rose[500],
    },
    accent: {
      ...colors.cyan,
      DEFAULT: colors.cyan[500],
    },
  },
  brand: {
    primary: customPalettes.brand,
  },
};

module.exports = {
  darkMode: ['selector', '.dark'],
  content: ['./projects/**/*.{html,scss,ts}'],
  important: true,
  theme: {
    extend: {
      colors: {
        gray: colors.slate,
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('./src/@fuse/tailwind/plugins/theming')({ themes }),
    require('./src/@fuse/tailwind/plugins/utilities'),
    require('./src/@fuse/tailwind/plugins/icon-size'),
    require('@tailwindcss/typography'),
  ],
};
```

#### Theme Persistence and Synchronization

```typescript
// theme-storage.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeStorageService {
  private readonly STORAGE_KEY = 'angular-v2-theme-preferences';
  
  saveThemePreferences(preferences: ThemePreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }
  
  loadThemePreferences(): ThemePreferences | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
      return null;
    }
  }
  
  clearThemePreferences(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export interface ThemePreferences {
  selectedTheme: string;
  customThemes: Record<string, ThemeConfig>;
  autoSwitchDarkMode: boolean;
  followSystemTheme: boolean;
}
```

#### Advanced Theme Features

**1. AI-Powered Theme Generation**
```typescript
// ai-theme-generator.service.ts
@Injectable({ providedIn: 'root' })
export class AIThemeGeneratorService {
  /**
   * Generate theme based on user preferences and usage patterns
   */
  async generatePersonalizedTheme(preferences: UserThemePreferences): Promise<ThemeConfig> {
    // Analyze user's color preferences, usage patterns, and accessibility needs
    const colorAnalysis = await this.analyzeColorPreferences(preferences);
    const accessibilityRequirements = this.getAccessibilityRequirements(preferences);
    
    return this.createOptimalTheme(colorAnalysis, accessibilityRequirements);
  }
  
  /**
   * Generate theme from uploaded image
   */
  async generateThemeFromImage(imageFile: File): Promise<ThemeConfig> {
    const dominantColors = await this.extractDominantColors(imageFile);
    return this.createThemeFromColorPalette(dominantColors);
  }
  
  /**
   * Suggest theme based on time of day and environment
   */
  generateContextualTheme(context: EnvironmentContext): ThemeConfig {
    const { timeOfDay, ambientLight, userActivity } = context;
    // Generate theme optimized for current context
    return this.createContextualTheme(timeOfDay, ambientLight, userActivity);
  }
}
```

**2. Advanced Animation and Transitions**
```typescript
// theme-transition.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeTransitionService {
  private readonly TRANSITION_DURATION = 300;
  
  /**
   * Smooth theme transition with morphing animations
   */
  async transitionToTheme(newTheme: ThemeConfig, options: TransitionOptions = {}): Promise<void> {
    const { 
      duration = this.TRANSITION_DURATION,
      easing = 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      morphElements = true,
      rippleEffect = false 
    } = options;
    
    if (morphElements) {
      await this.morphUIElements(newTheme, duration, easing);
    }
    
    if (rippleEffect) {
      await this.createRippleTransition(newTheme, duration);
    }
    
    return this.applyThemeWithAnimation(newTheme, duration, easing);
  }
  
  /**
   * Create ripple effect from theme selector button
   */
  private async createRippleTransition(theme: ThemeConfig, duration: number): Promise<void> {
    // Create expanding circle animation from the theme selector
    const ripple = this.createRippleElement(theme.primary.DEFAULT);
    document.body.appendChild(ripple);
    
    return new Promise(resolve => {
      ripple.addEventListener('animationend', () => {
        document.body.removeChild(ripple);
        resolve();
      });
    });
  }
}
```

**3. Accessibility-First Theme System**
```typescript
// accessibility-theme.service.ts
@Injectable({ providedIn: 'root' })
export class AccessibilityThemeService {
  /**
   * Generate high contrast theme variants
   */
  generateHighContrastTheme(baseTheme: ThemeConfig): ThemeConfig {
    return {
      ...baseTheme,
      name: `${baseTheme.name}-high-contrast`,
      displayName: `${baseTheme.displayName} (High Contrast)`,
      primary: this.enhanceContrast(baseTheme.primary),
      accent: this.enhanceContrast(baseTheme.accent),
      warn: this.enhanceContrast(baseTheme.warn),
    };
  }
  
  /**
   * Validate theme accessibility compliance
   */
  validateThemeAccessibility(theme: ThemeConfig): AccessibilityReport {
    const report: AccessibilityReport = {
      wcagAACompliant: true,
      wcagAAACompliant: true,
      issues: [],
      suggestions: [],
    };
    
    // Check contrast ratios
    const contrastIssues = this.checkContrastRatios(theme);
    report.issues.push(...contrastIssues);
    
    // Check color blindness compatibility
    const colorBlindnessIssues = this.checkColorBlindnessCompatibility(theme);
    report.issues.push(...colorBlindnessIssues);
    
    return report;
  }
  
  /**
   * Generate themes optimized for different types of color blindness
   */
  generateColorBlindFriendlyThemes(baseTheme: ThemeConfig): Record<string, ThemeConfig> {
    return {
      protanopia: this.optimizeForProtanopia(baseTheme),
      deuteranopia: this.optimizeForDeuteranopia(baseTheme),
      tritanopia: this.optimizeForTritanopia(baseTheme),
      monochromacy: this.optimizeForMonochromacy(baseTheme),
    };
  }
}
```

**4. Theme Marketplace and Sharing**
```typescript
// theme-marketplace.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeMarketplaceService {
  /**
   * Browse community themes
   */
  async browseCommunityThemes(filters: ThemeFilters = {}): Promise<CommunityTheme[]> {
    return this.http.get<CommunityTheme[]>('/api/themes/community', { params: filters }).toPromise();
  }
  
  /**
   * Share custom theme with community
   */
  async shareTheme(theme: ThemeConfig, metadata: ThemeMetadata): Promise<void> {
    const shareableTheme: ShareableTheme = {
      ...theme,
      metadata: {
        ...metadata,
        author: await this.getCurrentUser(),
        createdAt: new Date(),
        downloads: 0,
        rating: 0,
      },
    };
    
    return this.http.post('/api/themes/share', shareableTheme).toPromise();
  }
  
  /**
   * Import theme from URL or QR code
   */
  async importTheme(source: string): Promise<ThemeConfig> {
    if (this.isURL(source)) {
      return this.importFromURL(source);
    } else if (this.isThemeCode(source)) {
      return this.decodeTheme(source);
    }
    throw new Error('Invalid theme source');
  }
  
  /**
   * Generate shareable theme code/QR
   */
  generateShareableCode(theme: ThemeConfig): string {
    return btoa(JSON.stringify(this.sanitizeThemeForSharing(theme)));
  }
}
```

**5. Advanced Theme Customization UI**
```typescript
// advanced-theme-editor.component.ts
@Component({
  selector: 'app-advanced-theme-editor',
  template: `
    <div class="theme-editor">
      <!-- Color Palette Editor -->
      <div class="palette-editor">
        <h3>Color Palettes</h3>
        <div class="palette-section">
          <label>Primary Color</label>
          <app-color-palette-editor 
            [palette]="themeForm.get('primary')?.value"
            (paletteChange)="updatePalette('primary', $event)">
          </app-color-palette-editor>
        </div>
        <!-- Similar sections for accent and warn -->
      </div>
      
      <!-- Live Preview -->
      <div class="live-preview">
        <h3>Live Preview</h3>
        <div class="preview-container" [attr.data-theme]="previewTheme.name">
          <app-chat-preview [theme]="previewTheme"></app-chat-preview>
        </div>
      </div>
      
      <!-- Advanced Options -->
      <div class="advanced-options">
        <h3>Advanced Settings</h3>
        
        <!-- Typography Scale -->
        <app-typography-editor 
          [typography]="themeForm.get('typography')?.value"
          (typographyChange)="updateTypography($event)">
        </app-typography-editor>
        
        <!-- Spacing Scale -->
        <app-spacing-editor 
          [spacing]="themeForm.get('spacing')?.value"
          (spacingChange)="updateSpacing($event)">
        </app-spacing-editor>
        
        <!-- Border Radius -->
        <app-border-radius-editor 
          [borderRadius]="themeForm.get('borderRadius')?.value"
          (borderRadiusChange)="updateBorderRadius($event)">
        </app-border-radius-editor>
        
        <!-- Shadow System -->
        <app-shadow-editor 
          [shadows]="themeForm.get('shadows')?.value"
          (shadowsChange)="updateShadows($event)">
        </app-shadow-editor>
      </div>
      
      <!-- AI Suggestions -->
      <div class="ai-suggestions">
        <h3>AI Suggestions</h3>
        <button mat-button (click)="generateAISuggestions()">
          <mat-icon>auto_awesome</mat-icon>
          Generate Suggestions
        </button>
        
        @if (aiSuggestions().length > 0) {
          <div class="suggestions-grid">
            @for (suggestion of aiSuggestions(); track suggestion.id) {
              <div class="suggestion-card" (click)="applySuggestion(suggestion)">
                <div class="suggestion-preview"></div>
                <p>{{ suggestion.description }}</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AdvancedThemeEditorComponent {
  // Advanced theme editing implementation
}
```

**6. Performance Optimizations**
```typescript
// theme-performance.service.ts
@Injectable({ providedIn: 'root' })
export class ThemePerformanceService {
  private themeCache = new Map<string, ThemeConfig>();
  private cssCache = new Map<string, string>();
  
  /**
   * Preload popular themes for instant switching
   */
  async preloadPopularThemes(): Promise<void> {
    const popularThemes = await this.getPopularThemes();
    const preloadPromises = popularThemes.map(theme => this.preloadTheme(theme));
    await Promise.all(preloadPromises);
  }
  
  /**
   * Generate optimized CSS for theme
   */
  generateOptimizedCSS(theme: ThemeConfig): string {
    const cacheKey = this.generateCacheKey(theme);
    
    if (this.cssCache.has(cacheKey)) {
      return this.cssCache.get(cacheKey)!;
    }
    
    const optimizedCSS = this.compileThemeCSS(theme);
    this.cssCache.set(cacheKey, optimizedCSS);
    
    return optimizedCSS;
  }
  
  /**
   * Lazy load theme assets
   */
  async lazyLoadThemeAssets(theme: ThemeConfig): Promise<void> {
    const assets = this.getThemeAssets(theme);
    return this.loadAssetsInBackground(assets);
  }
}
```

**7. Integration Features**
```typescript
// theme-integration.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeIntegrationService {
  /**
   * Sync theme with system wallpaper (macOS/Windows)
   */
  async syncWithSystemWallpaper(): Promise<ThemeConfig | null> {
    if ('wallpaper' in navigator) {
      const wallpaperColors = await (navigator as any).wallpaper.getDominantColors();
      return this.generateThemeFromColors(wallpaperColors);
    }
    return null;
  }
  
  /**
   * Integrate with calendar for time-based themes
   */
  setupTimeBasedThemes(schedule: ThemeSchedule[]): void {
    schedule.forEach(({ time, theme }) => {
      this.scheduleThemeChange(time, theme);
    });
  }
  
  /**
   * Weather-based theme suggestions
   */
  async getWeatherBasedTheme(location: GeolocationCoordinates): Promise<ThemeConfig> {
    const weather = await this.getWeatherData(location);
    return this.generateWeatherTheme(weather);
  }
}
```

These additional features would make the theme system incredibly powerful and user-friendly:

🤖 **AI-Powered**: Personalized theme generation, image-based themes, contextual suggestions
🎨 **Advanced Customization**: Visual editors for all design tokens, live preview, AI suggestions  
♿ **Accessibility-First**: High contrast variants, color blindness optimization, WCAG compliance
🌐 **Community Features**: Theme marketplace, sharing, importing from QR codes
⚡ **Performance**: Optimized CSS generation, preloading, lazy loading
🔗 **Smart Integrations**: System wallpaper sync, time-based themes, weather themes

Would you like me to proceed with creating the implementation tasks, or would you like to explore any of these additional features in more detail?
### Tem
plate and Style File Structure

All components will use dedicated template and style files following Angular best practices:

```
projects/shared-lib/src/lib/components/
├── message-bubble/
│   ├── message-bubble.component.ts
│   ├── message-bubble.component.html
│   ├── message-bubble.component.scss
│   └── message-bubble.component.spec.ts
├── base/
│   ├── base.component.ts
│   ├── base.component.html
│   ├── base.component.scss
│   └── base.component.spec.ts
└── user-avatar/
    ├── user-avatar.component.ts
    ├── user-avatar.component.html
    ├── user-avatar.component.scss
    └── user-avatar.component.spec.ts
```

**Template Files (.html):**
- Clean, semantic HTML structure
- Accessibility attributes (ARIA labels, roles)
- Angular template syntax with signals
- Conditional rendering with @if and @for

**Style Files (.scss):**
- SCSS with Tailwind CSS utilities
- Component-scoped styles
- CSS custom properties for theming
- Responsive design with container queries

Example template structure:
```html
<!-- message-bubble.component.html -->
<div class="message-bubble" 
     [class.sent]="isSent()" 
     [class.received]="!isSent()"
     role="article"
     [attr.aria-label]="'Message from ' + message().senderName">
  <div class="message-content">
    {{ message().content }}
  </div>
  <div class="message-metadata">
    <time class="message-timestamp" 
          [dateTime]="message().timestamp | date:'yyyy-MM-ddTHH:mm:ss'">
      {{ formattedTime() }}
    </time>
    @if (message().status) {
      <span class="message-status" [attr.aria-label]="'Message status: ' + message().status">
        {{ message().status }}
      </span>
    }
  </div>
</div>
```

Example style structure:
```scss
/* message-bubble.component.scss */
:host {
  @apply block mb-2;
}

.message-bubble {
  @apply max-w-xs p-3 rounded-lg shadow-sm;
  
  &.sent {
    @apply bg-blue-500 text-white ml-auto;
    border-bottom-right-radius: 0.25rem;
  }
  
  &.received {
    @apply bg-gray-100 text-gray-900 mr-auto;
    border-bottom-left-radius: 0.25rem;
  }
  
  .message-content {
    @apply text-sm leading-relaxed;
  }
  
  .message-metadata {
    @apply flex justify-between items-center mt-1 text-xs opacity-75;
  }
  
  .message-timestamp {
    @apply font-medium;
  }
  
  .message-status {
    @apply ml-2;
  }
}

/* Dark theme support */
:host-context(.dark) .message-bubble {
  &.received {
    @apply bg-gray-800 text-gray-100;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .message-bubble {
    @apply border-2 border-solid;
    
    &.sent {
      @apply border-blue-700;
    }
    
    &.received {
      @apply border-gray-400;
    }
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .message-bubble {
    transition: none;
  }
}
```