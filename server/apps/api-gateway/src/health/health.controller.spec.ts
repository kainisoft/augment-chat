import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayHealthController, ApiGatewayHealthService } from './health.controller';
import { ServiceUnavailableException } from '@nestjs/common';

describe('ApiGatewayHealthController', () => {
  let controller: ApiGatewayHealthController;
  let healthService: ApiGatewayHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayHealthController],
      providers: [ApiGatewayHealthService],
    }).compile();

    controller = module.get<ApiGatewayHealthController>(ApiGatewayHealthController);
    healthService = module.get<ApiGatewayHealthService>(ApiGatewayHealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getServiceName', () => {
    it('should return the correct service name', () => {
      // Using any to access protected method
      expect((controller as any).getServiceName()).toBe('api-gateway');
    });
  });

  describe('checkComponents', () => {
    it('should include base components and service status', async () => {
      // Mock the service check method
      jest.spyOn(healthService, 'checkServices').mockResolvedValue({
        status: 'ok',
        details: {
          services: {
            'user-service': 'connected',
            'auth-service': 'connected',
            'chat-service': 'connected',
            'notification-service': 'connected',
          },
        },
      });

      // Call the protected method directly
      const result = await (controller as any).checkComponents();

      // Verify the result structure
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('services');
      expect(result.system).toHaveProperty('status', 'ok');
      expect(result.services).toHaveProperty('status', 'ok');
      expect(result.services.details.services).toHaveProperty('user-service', 'connected');
      expect(result.services.details.services).toHaveProperty('auth-service', 'connected');
      expect(result.services.details.services).toHaveProperty('chat-service', 'connected');
      expect(result.services.details.services).toHaveProperty('notification-service', 'connected');
    });

    it('should handle service check errors', async () => {
      // Mock the service check method to return an error
      jest.spyOn(healthService, 'checkServices').mockResolvedValue({
        status: 'error',
        details: {
          message: 'Service connection failed',
        },
      });

      // Call the protected method directly
      const result = await (controller as any).checkComponents();

      // Verify the result structure
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('services');
      expect(result.system).toHaveProperty('status', 'ok');
      expect(result.services).toHaveProperty('status', 'error');
      expect(result.services.details).toHaveProperty('message', 'Service connection failed');
    });
  });

  describe('check', () => {
    it('should return health status when all components are healthy', async () => {
      // Mock the checkComponents method
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        services: {
          status: 'ok',
          details: {
            services: {
              'user-service': 'connected',
              'auth-service': 'connected',
            },
          },
        },
      });

      const result = await controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'api-gateway');
      expect(result).toHaveProperty('components');
      expect(result.components).toHaveProperty('system');
      expect(result.components).toHaveProperty('services');
      expect(result.components.system).toHaveProperty('status', 'ok');
      expect(result.components.services).toHaveProperty('status', 'ok');
    });

    it('should throw ServiceUnavailableException when any component has an error', async () => {
      // Mock the checkComponents method to return an error
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        services: {
          status: 'error',
          details: {
            message: 'Service connection failed',
          },
        },
      });

      await expect(controller.check()).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('liveness', () => {
    it('should return basic liveness status', () => {
      const result = controller.liveness();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service', 'api-gateway');
    });
  });

  describe('readiness', () => {
    it('should return readiness status when all components are ready', async () => {
      // Mock the checkComponents method
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        services: { status: 'ok' },
      });

      const result = await controller.readiness();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('components');
      expect(result.components).toHaveProperty('system');
      expect(result.components).toHaveProperty('services');
    });

    it('should throw ServiceUnavailableException when any component is not ready', async () => {
      // Mock the checkComponents method to return an error
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        services: { status: 'error' },
      });

      await expect(controller.readiness()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});

describe('ApiGatewayHealthService', () => {
  let service: ApiGatewayHealthService;
  let mockLoggingService: any;
  let mockErrorLogger: any;

  beforeEach(() => {
    mockLoggingService = {
      setContext: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    mockErrorLogger = {
      error: jest.fn(),
    };

    service = new ApiGatewayHealthService(mockLoggingService, mockErrorLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkServices', () => {
    it('should return ok status with service details', async () => {
      const result = await service.checkServices();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('details');
      expect(result.details).toHaveProperty('services');
      expect(result.details.services).toHaveProperty('user-service', 'connected');
      expect(result.details.services).toHaveProperty('auth-service', 'connected');
      expect(result.details.services).toHaveProperty('chat-service', 'connected');
      expect(result.details.services).toHaveProperty('notification-service', 'connected');
    });

    // Skip this test for now as it's difficult to simulate the error condition
    it.skip('should handle errors during service check', async () => {
      // This is a placeholder for a future test that would verify error handling
      // The actual implementation would need to mock the internal Promise in a way
      // that doesn't cause linting issues
    });
  });
});
