export const environment = {
  production: true,
  development: false,
  
  // API Configuration - Production URLs
  api: {
    graphqlUrl: 'https://api.chat.example.com/graphql',
    websocketUrl: 'wss://api.chat.example.com/graphql',
    restApiUrl: 'https://api.chat.example.com/api',
  },

  // Service URLs
  authServiceUrl: 'https://auth.chat.example.com/api',
  
  // WebSocket Configuration
  websocket: {
    url: 'wss://api.chat.example.com/ws',
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    enableHeartbeat: true,
    heartbeatInterval: 30000,
  },
  
  // GraphQL Configuration
  graphql: {
    enableSubscriptions: true,
    enableErrorLogging: true,
    enableDevTools: false, // Disabled in production
    cacheSize: 100, // MB - Larger cache for production
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
    enableVoiceMessages: true,
    enableVideoCall: true,
    maxFileSize: 25 * 1024 * 1024, // 25MB for production
  },
  
  // Performance Configuration
  performance: {
    enableVirtualScrolling: true,
    messagePageSize: 100, // Larger page size for production
    conversationPageSize: 50,
    enableLazyLoading: true,
    enableServiceWorker: true, // Enable PWA features in production
  },
  
  // Logging Configuration
  logging: {
    level: 'error', // Only log errors in production
    enableConsoleLogging: false,
    enableRemoteLogging: true,
    logRetentionDays: 30,
  },
  
  // UI Configuration
  ui: {
    defaultTheme: 'auto' as 'light' | 'dark' | 'auto',
    enableAnimations: true,
    enableSounds: true,
    compactMode: false,
  },
};
