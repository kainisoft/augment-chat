export const environment = {
  production: false,
  development: true,
  
  // API Configuration
  api: {
    graphqlUrl: 'http://localhost:4000/graphql',
    websocketUrl: 'ws://localhost:4001/graphql',
    restApiUrl: 'http://localhost:4000/api',
  },

  // Service URLs
  authServiceUrl: 'http://localhost:4002/api',
  
  // WebSocket Configuration
  websocket: {
    url: 'ws://localhost:4001/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    enableHeartbeat: true,
    heartbeatInterval: 30000,
  },
  
  // GraphQL Configuration
  graphql: {
    enableSubscriptions: true,
    enableErrorLogging: true,
    enableDevTools: true,
    cacheSize: 50, // MB
  },
  
  // Authentication Configuration
  auth: {
    tokenStorageKey: 'chat_auth_token',
    refreshTokenStorageKey: 'chat_refresh_token',
    tokenExpirationBuffer: 300, // 5 minutes in seconds
  },
  
  // Feature Flags
  features: {
    enableOfflineMode: true,
    enablePushNotifications: true,
    enableFileUpload: true,
    enableVoiceMessages: false,
    enableVideoCall: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  
  // Performance Configuration
  performance: {
    enableVirtualScrolling: true,
    messagePageSize: 50,
    conversationPageSize: 20,
    enableLazyLoading: true,
    enableServiceWorker: false,
  },
  
  // Logging Configuration
  logging: {
    level: 'debug',
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    logRetentionDays: 7,
  },
  
  // UI Configuration
  ui: {
    defaultTheme: 'auto' as 'light' | 'dark' | 'auto',
    enableAnimations: true,
    enableSounds: true,
    compactMode: false,
  },
};
