export const environment = {
    production: false,
    development: true,
    debug: true,
    enableDevTools: true,
    enablePerformanceMonitoring: true,
    enableSourceMaps: true,
    logLevel: 'debug',
    api: {
        baseUrl: 'http://localhost:3000',
        graphqlUrl: 'http://localhost:3000/graphql',
        websocketUrl: 'ws://localhost:3000/ws',
    },
    features: {
        hmr: true,
        bundleAnalyzer: true,
        performanceMetrics: true,
        debugConsole: true,
    },
    build: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        commit: 'development',
    }
};