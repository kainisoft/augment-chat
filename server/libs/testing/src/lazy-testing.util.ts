/**
 * Lazy Testing Utilities
 *
 * Provides dynamic imports for testing utilities to prevent inclusion in production bundles.
 * All testing utilities are lazy-loaded to improve tree-shaking effectiveness.
 */

// Mock code splitting manager for testing
const mockCodeSplittingManager = {
  lazyLoad: async (moduleId: string, importFn: () => Promise<any>, options?: any) => {
    return importFn();
  }
};

/**
 * Lazy load testing utilities
 */
export class LazyTestingUtils {
  /**
   * Lazy load MockFactoryService
   */
  static async getMockFactoryService() {
    return mockCodeSplittingManager.lazyLoad(
      'mock-factory-service',
      async () => {
        const module = await import('./mocks/mock-factory.service');
        return module.MockFactoryService;
      },
      {
        timeout: 10000,
        onLoad: () => console.debug('MockFactoryService loaded'),
      },
    );
  }

  /**
   * Lazy load ControllerTestBuilder
   */
  static async getControllerTestBuilder() {
    return mockCodeSplittingManager.lazyLoad(
      'controller-test-builder',
      async () => {
        const module = await import('./builders/controller-test.builder');
        return module.ControllerTestBuilder;
      },
      {
        timeout: 10000,
        onLoad: () => console.debug('ControllerTestBuilder loaded'),
      },
    );
  }

  /**
   * Lazy load ServiceTestBuilder
   */
  static async getServiceTestBuilder() {
    return mockCodeSplittingManager.lazyLoad(
      'service-test-builder',
      async () => {
        const module = await import('./builders/service-test.builder');
        return module.ServiceTestBuilder;
      },
      {
        timeout: 10000,
        onLoad: () => console.debug('ServiceTestBuilder loaded'),
      },
    );
  }

  /**
   * Lazy load TestSetupService
   */
  static async getTestSetupService() {
    return mockCodeSplittingManager.lazyLoad(
      'test-setup-service',
      async () => {
        const module = await import('./builders/test-setup.service');
        return module.TestSetupService;
      },
      {
        timeout: 10000,
        onLoad: () => console.debug('TestSetupService loaded'),
      },
    );
  }

  /**
   * Lazy load TestDatabaseService
   */
  static async getTestDatabaseService() {
    return mockCodeSplittingManager.lazyLoad(
      'test-database-service',
      async () => {
        const module = await import('./database/test-database.service');
        return module.TestDatabaseService;
      },
      {
        timeout: 10000,
        onLoad: () => console.debug('TestDatabaseService loaded'),
      },
    );
  }

  /**
   * Lazy load E2ETestSetupService
   */
  static async getE2ETestSetupService() {
    return mockCodeSplittingManager.lazyLoad(
      'e2e-test-setup-service',
      async () => {
        const module = await import('./e2e/e2e-test-setup.service');
        return module.E2ETestSetupService;
      },
      {
        timeout: 15000,
        onLoad: () => console.debug('E2ETestSetupService loaded'),
      },
    );
  }

  /**
   * Preload all testing utilities (for test environments)
   */
  static async preloadAllTestingUtils() {
    if (process.env.NODE_ENV === 'test') {
      console.log('🧪 Preloading testing utilities...');

      await Promise.all([
        this.getMockFactoryService(),
        this.getControllerTestBuilder(),
        this.getServiceTestBuilder(),
        this.getTestSetupService(),
        this.getTestDatabaseService(),
        this.getE2ETestSetupService(),
      ]);

      console.log('✅ Testing utilities preloaded');
    }
  }

  /**
   * Create a test suite with lazy-loaded utilities
   */
  static async createTestSuite(suiteName: string) {
    const [
      MockFactoryService,
      ControllerTestBuilder,
      ServiceTestBuilder,
      TestSetupService,
    ] = await Promise.all([
      this.getMockFactoryService(),
      this.getControllerTestBuilder(),
      this.getServiceTestBuilder(),
      this.getTestSetupService(),
    ]);

    return {
      MockFactoryService,
      ControllerTestBuilder,
      ServiceTestBuilder,
      TestSetupService,
      suiteName,
    };
  }
}

/**
 * Convenience functions for backward compatibility
 */
export const lazyLoadMockFactory = LazyTestingUtils.getMockFactoryService;
export const lazyLoadControllerTestBuilder = LazyTestingUtils.getControllerTestBuilder;
export const lazyLoadServiceTestBuilder = LazyTestingUtils.getServiceTestBuilder;
export const lazyLoadTestSetup = LazyTestingUtils.getTestSetupService;
