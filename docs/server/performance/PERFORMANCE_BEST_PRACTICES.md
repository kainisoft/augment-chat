# Performance Best Practices Guide

**Shared Infrastructure Modules - Performance Optimization Guidelines**

This guide provides developers with best practices for using our performance optimization tools and maintaining optimal performance across all microservices.

## Table of Contents

1. [Performance Monitoring](#performance-monitoring)
2. [Bundle Size Optimization](#bundle-size-optimization)
3. [Memory Management](#memory-management)
4. [Caching and Memoization](#caching-and-memoization)
5. [Lazy Loading and Code Splitting](#lazy-loading-and-code-splitting)
6. [Validation Performance](#validation-performance)
7. [Security Optimization](#security-optimization)
8. [Testing Performance](#testing-performance)
9. [Development Workflow](#development-workflow)
10. [Monitoring and Alerts](#monitoring-and-alerts)

## Performance Monitoring

### Using Performance Analysis Tools

#### 1. Establish Performance Baseline

```bash
# Run comprehensive performance analysis
pnpm perf:baseline

# Individual analysis tools
pnpm perf:monitor    # General performance monitoring
pnpm perf:bundle     # Bundle size analysis
pnpm perf:memory     # Memory usage tracking
pnpm perf:response   # Response time benchmarking
pnpm perf:deps       # Dependency analysis
pnpm perf:treeshake  # Tree-shaking effectiveness
```

#### 2. Regular Performance Monitoring

```typescript
// In your service main.ts
import { PerformanceIntegrationService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Performance monitoring will start automatically
  const perfService = app.get(PerformanceIntegrationService);
  
  // Get current performance metrics
  const metrics = perfService.getPerformanceMetrics();
  console.log('Performance Health Score:', perfService.getHealthScore());
  
  await app.listen(3000);
}
```

#### 3. Performance Health Monitoring

```typescript
// Check performance health in your services
import { PerformanceIntegrationService } from '@app/common';

@Injectable()
export class HealthService {
  constructor(
    private readonly perfService: PerformanceIntegrationService,
  ) {}

  async getPerformanceHealth() {
    const healthScore = this.perfService.getHealthScore();
    const recommendations = this.perfService.generateOptimizationRecommendations();
    
    return {
      overall: healthScore.overall,
      breakdown: healthScore.breakdown,
      recommendations: recommendations.immediate,
    };
  }
}
```

## Bundle Size Optimization

### 1. Import Optimization

#### ✅ Good: Selective Imports
```typescript
// Use selective imports for better tree-shaking
import { LoginDto, RegisterDto } from '@app/dtos';
import { IsEmailField, IsStrongPasswordField } from '@app/validation';
import { RateLimitService } from '@app/security';
```

#### ❌ Bad: Barrel Imports
```typescript
// Avoid importing everything
import * as dtos from '@app/dtos';
import * as validation from '@app/validation';
```

### 2. Dynamic Imports for Optional Features

```typescript
// Use dynamic imports for optional or heavy features
export class AuthService {
  async performHeavyCrypto() {
    // Lazy load heavy crypto operations
    const { LazySecurityService } = await import('@app/security');
    const securityService = new LazySecurityService();
    const bcrypt = await securityService.getBcrypt();
    
    return bcrypt.hash(password, 10);
  }
}
```

### 3. Tree-Shaking Best Practices

```typescript
// Create focused, single-purpose modules
export class ValidationUtils {
  // Export only what's needed
  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Use selective exports in index.ts
export { ValidationUtils } from './validation-utils';
// Don't use: export * from './validation-utils';
```

## Memory Management

### 1. Using Object Pools

```typescript
import { ObjectPool, MemoryOptimizedOps } from '@app/common';

// Create object pool for frequently created objects
const userPool = new ObjectPool(
  () => ({ id: '', email: '', username: '' }), // Create function
  (user) => { user.id = ''; user.email = ''; user.username = ''; }, // Reset function
  50 // Max pool size
);

export class UserService {
  createUser(data: CreateUserDto) {
    // Use pooled object
    const user = userPool.acquire();
    try {
      user.id = data.id;
      user.email = data.email;
      user.username = data.username;
      
      // Process user...
      return this.saveUser(user);
    } finally {
      // Return to pool
      userPool.release(user);
    }
  }
}
```

### 2. Memory-Efficient Operations

```typescript
import { MemoryOptimizedOps } from '@app/common';

export class DataProcessor {
  processLargeDataset(items: any[]) {
    // Use in-place operations to avoid creating new arrays
    MemoryOptimizedOps.filterInPlace(items, item => item.isActive);
    MemoryOptimizedOps.mapInPlace(items, item => ({ ...item, processed: true }));
    
    return items;
  }
  
  buildLargeString(parts: string[]) {
    // Use StringBuilder for efficient string concatenation
    return MemoryOptimizedOps.joinStrings(' ', ...parts);
  }
}
```

### 3. Memory Monitoring

```typescript
import { GlobalMemoryOptimizer } from '@app/common';

export class MemoryAwareService {
  @memoryOptimized
  async processLargeData(data: any[]) {
    // Method will be monitored for memory usage
    const result = await this.heavyProcessing(data);
    
    // Force GC if memory usage is high
    if (process.memoryUsage().heapUsed > 200 * 1024 * 1024) {
      GlobalMemoryOptimizer.forceGC();
    }
    
    return result;
  }
}
```

## Caching and Memoization

### 1. Validation Caching

```typescript
import { 
  ValidationCacheService, 
  IsOptimizedEmailField, 
  IsOptimizedUUIDField 
} from '@app/validation';

export class CreateUserDto {
  @IsOptimizedEmailField() // Uses caching automatically
  email: string;
  
  @IsOptimizedUUIDField() // Uses caching automatically
  id: string;
}

// Manual caching for custom validation
export class CustomValidationService {
  constructor(private readonly cacheService: ValidationCacheService) {}
  
  validateCustomRule(value: string): boolean {
    return this.cacheService.memoize(
      'custom-rule',
      (val) => this.expensiveValidation(val),
      (val) => `custom_${val}`, // Key generator
      { maxSize: 100, ttlMs: 5 * 60 * 1000 } // Options
    )(value);
  }
}
```

### 2. Function Memoization

```typescript
import { memoize, MemoizationUtils } from '@app/common';

export class DataService {
  // Automatic memoization with decorator
  @memoize({ maxSize: 200, ttlMs: 10 * 60 * 1000 })
  async expensiveCalculation(input: string): Promise<number> {
    // Expensive operation that benefits from caching
    return this.performComplexCalculation(input);
  }
  
  // Manual memoization
  private memoizedFunction = MemoizationUtils.memoizeFunction(
    (a: number, b: number) => a * b * Math.random(),
    { maxSize: 50, ttlMs: 5 * 60 * 1000 }
  );
  
  calculate(a: number, b: number): number {
    return this.memoizedFunction(a, b);
  }
}
```

## Lazy Loading and Code Splitting

### 1. Lazy Loading Services

```typescript
import { LazyLoad, codeSplittingManager } from '@app/common';

export class FeatureService {
  @LazyLoad(
    'heavy-feature',
    () => import('./heavy-feature.module'),
    { timeout: 15000 }
  )
  async useHeavyFeature() {
    // Heavy feature will be loaded only when this method is called
    return this.processHeavyFeature();
  }
  
  // Manual lazy loading
  async loadOptionalFeature() {
    const module = await codeSplittingManager.lazyLoad(
      'optional-feature',
      () => import('./optional-feature'),
      {
        timeout: 10000,
        retries: 3,
        onLoad: () => console.log('Optional feature loaded'),
        onError: (error) => console.error('Failed to load feature:', error),
      }
    );
    
    return module.OptionalFeature;
  }
}
```

### 2. Testing Utilities Lazy Loading

```typescript
// In test files, use lazy loading for testing utilities
import { LazyTestingUtils } from '@app/testing';

describe('UserService', () => {
  let mockFactory: any;
  let testBuilder: any;
  
  beforeAll(async () => {
    // Load testing utilities only in test environment
    mockFactory = await LazyTestingUtils.getMockFactoryService();
    testBuilder = await LazyTestingUtils.getControllerTestBuilder();
  });
  
  it('should create user', async () => {
    const mockUser = mockFactory.createMockUser();
    // Test implementation...
  });
});
```

## Validation Performance

### 1. Optimized Validation Decorators

```typescript
import { 
  IsOptimizedEmailField,
  IsOptimizedUUIDField,
  IsOptimizedStrongPasswordField,
  ValidationPerformanceUtils
} from '@app/validation';

export class UserDto {
  @IsOptimizedEmailField() // Cached validation
  email: string;
  
  @IsOptimizedUUIDField() // Cached validation
  id: string;
  
  @IsOptimizedStrongPasswordField() // Memoized validation
  password: string;
}

// Monitor validation performance
export class ValidationMonitoringService {
  getValidationStats() {
    return ValidationPerformanceUtils.getPerformanceReport();
  }
  
  optimizeValidationCaches() {
    ValidationPerformanceUtils.cleanupCaches();
    ValidationPerformanceUtils.warmUpCaches();
  }
}
```

### 2. Batch Validation

```typescript
import { IsBatchValidatedFields } from '@app/validation';

export class ComplexDto {
  @IsBatchValidatedFields([
    { field: 'email', validator: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), message: 'Invalid email' },
    { field: 'username', validator: (val) => val.length >= 3, message: 'Username too short' },
  ])
  validateUserData: boolean;
  
  email: string;
  username: string;
}
```

## Security Optimization

### 1. Lazy Security Operations

```typescript
import { LazySecurityService, MemoizedSecurityOperation } from '@app/security';

export class AuthService {
  constructor(private readonly lazySecurityService: LazySecurityService) {}
  
  @MemoizedSecurityOperation(2 * 60 * 1000) // 2 minutes cache
  async hashPassword(password: string): Promise<string> {
    const bcrypt = await this.lazySecurityService.getBcrypt();
    return bcrypt.hash(password, 10);
  }
  
  async validateToken(token: string): Promise<boolean> {
    const validators = await this.lazySecurityService.getSecurityValidators();
    return validators.validateJWT(token);
  }
}
```

### 2. Rate Limiting Optimization

```typescript
import { RateLimitService } from '@app/security';

@Controller('api')
export class ApiController {
  constructor(private readonly rateLimitService: RateLimitService) {}
  
  @Post('data')
  async handleRequest(@Req() req: Request) {
    // Efficient rate limiting with memory optimization
    const isAllowed = await this.rateLimitService.checkLimit(
      req.ip,
      { windowMs: 60000, maxRequests: 100 }
    );
    
    if (!isAllowed) {
      throw new TooManyRequestsException();
    }
    
    return this.processRequest(req);
  }
}
```

## Testing Performance

### 1. Efficient Test Setup

```typescript
import { LazyTestingUtils } from '@app/testing';

describe('Performance Tests', () => {
  // Preload testing utilities for better performance
  beforeAll(async () => {
    await LazyTestingUtils.preloadAllTestingUtils();
  });
  
  it('should perform efficiently', async () => {
    const testSuite = await LazyTestingUtils.createTestSuite('UserService');
    const mockUser = testSuite.MockFactoryService.createMockUser();
    
    // Performance test implementation...
  });
});
```

### 2. Performance Testing

```typescript
import { PerformanceMonitor } from '@app/common';

describe('Performance Benchmarks', () => {
  let performanceMonitor: PerformanceMonitor;
  
  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });
  
  it('should meet performance requirements', async () => {
    const startTime = performance.now();
    
    // Run operation
    await serviceUnderTest.performOperation();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms requirement
  });
});
```

## Development Workflow

### 1. Pre-commit Performance Checks

```bash
# Add to package.json scripts
{
  "scripts": {
    "perf:check": "pnpm perf:deps && pnpm perf:treeshake",
    "perf:validate": "pnpm build:all && pnpm perf:baseline",
    "pre-commit": "pnpm perf:check && pnpm test"
  }
}
```

### 2. Performance-Aware Development

```typescript
// Use performance decorators during development
import { memoryOptimized, LazySecurityOperation } from '@app/common';

export class DevelopmentService {
  @memoryOptimized
  async processData(data: any[]) {
    // Method will log memory usage during development
    return this.heavyProcessing(data);
  }
  
  @LazySecurityOperation('crypto-operation')
  async performCrypto() {
    // Operation will be logged and monitored
    return this.cryptoOperation();
  }
}
```

## Monitoring and Alerts

### 1. Performance Health Checks

```typescript
import { PerformanceIntegrationService } from '@app/common';

@Controller('health')
export class HealthController {
  constructor(
    private readonly perfService: PerformanceIntegrationService,
  ) {}
  
  @Get('performance')
  async getPerformanceHealth() {
    const healthScore = this.perfService.getHealthScore();
    const recommendations = this.perfService.generateOptimizationRecommendations();
    
    return {
      status: healthScore.overall > 70 ? 'healthy' : 'degraded',
      score: healthScore.overall,
      breakdown: healthScore.breakdown,
      recommendations: recommendations.immediate,
    };
  }
}
```

### 2. Automated Performance Monitoring

```typescript
// In your main application bootstrap
import { PerformanceIntegrationService } from '@app/common';

async function setupPerformanceMonitoring(app: INestApplication) {
  const perfService = app.get(PerformanceIntegrationService);
  
  // Set up automated monitoring
  setInterval(async () => {
    const healthScore = perfService.getHealthScore();
    
    if (healthScore.overall < 70) {
      console.warn('Performance degradation detected:', healthScore);
      
      // Trigger automatic optimizations
      await perfService.performAutomaticOptimizations();
    }
  }, 60000); // Check every minute
}
```

## Performance Budgets

### 1. Bundle Size Budgets

```typescript
// In your CI/CD pipeline
const BUNDLE_SIZE_LIMITS = {
  'api-gateway': 500 * 1024, // 500KB
  'auth-service': 800 * 1024, // 800KB
  'user-service': 700 * 1024, // 700KB
  'chat-service': 500 * 1024, // 500KB
  'notification-service': 500 * 1024, // 500KB
  'logging-service': 500 * 1024, // 500KB
};

// Validate bundle sizes in CI
function validateBundleSizes() {
  const analyzer = new BundleAnalyzer();
  const analysis = analyzer.analyzeBundles();
  
  for (const bundle of analysis.bundleDetails) {
    const limit = BUNDLE_SIZE_LIMITS[bundle.service];
    if (bundle.mainBundle.size > limit) {
      throw new Error(`Bundle size exceeded for ${bundle.service}: ${bundle.mainBundle.sizeFormatted} > ${formatBytes(limit)}`);
    }
  }
}
```

### 2. Performance Regression Testing

```typescript
// Performance regression test
describe('Performance Regression Tests', () => {
  it('should not regress in response time', async () => {
    const analyzer = new ResponseTimeAnalyzer();
    const benchmark = await analyzer.runPerformanceTests();
    
    expect(benchmark.summary.averageResponseTime).toBeLessThan(10); // 10ms limit
    expect(benchmark.summary.performanceScore).toBeGreaterThan(90); // 90/100 minimum
  });
  
  it('should not regress in memory usage', async () => {
    const tracker = new MemoryTracker();
    tracker.startTracking();
    
    // Run operations
    await performOperations();
    
    const profile = tracker.stopTracking();
    expect(profile.statistics.memoryLeakSuspected).toBe(false);
    expect(profile.statistics.averageHeapUsed).toBeLessThan(200 * 1024 * 1024); // 200MB limit
  });
});
```

## Troubleshooting Performance Issues

### 1. Common Performance Problems

| Problem | Symptoms | Solution |
|---------|----------|----------|
| **High Memory Usage** | Heap > 200MB | Use memory pools, check for leaks |
| **Slow Response Times** | > 10ms average | Enable caching, optimize queries |
| **Large Bundle Sizes** | > 1MB per service | Use tree-shaking, remove unused deps |
| **Build Time Issues** | > 10s builds | Optimize imports, use incremental builds |

### 2. Performance Debugging

```bash
# Debug performance issues
pnpm perf:baseline  # Get current state
pnpm perf:deps      # Check for heavy dependencies
pnpm perf:treeshake # Analyze tree-shaking effectiveness
pnpm perf:memory    # Check for memory issues
```

## Best Practices Summary

### ✅ Do's
- Use selective imports instead of barrel imports
- Implement caching for frequently used operations
- Use lazy loading for heavy or optional features
- Monitor performance regularly with our tools
- Use object pools for frequently created objects
- Implement memoization for expensive calculations
- Use optimized validation decorators
- Test performance in CI/CD pipeline

### ❌ Don'ts
- Import entire modules when you only need specific exports
- Create new objects in hot paths without pooling
- Ignore performance monitoring alerts
- Skip performance testing in development
- Use synchronous operations for heavy tasks
- Forget to clean up caches and pools
- Ignore bundle size increases
- Deploy without performance validation

This guide provides the foundation for maintaining optimal performance across all shared infrastructure modules. Regular monitoring and adherence to these practices will ensure continued excellent performance as the application evolves.
