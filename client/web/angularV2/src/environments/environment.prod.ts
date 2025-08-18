export const environment = {
  production: true,
  development: false,
  debug: false,
  enableDevTools: false,
  enablePerformanceMonitoring: true,
  enableSourceMaps: false,
  logLevel: 'error',
  api: {
    baseUrl: 'https://api.yourdomain.com',
    graphqlUrl: 'https://api.yourdomain.com/graphql',
    websocketUrl: 'wss://api.yourdomain.com/ws',
  },
  features: {
    hmr: false,
    bundleAnalyzer: false,
    performanceMetrics: true,
    debugConsole: false,
  },
  build: {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    commit: process.env['GIT_COMMIT'] || 'unknown',
  }
};