import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationServiceHealthController,
  NotificationServiceHealthService,
} from './health.controller';
import { ServiceUnavailableException } from '@nestjs/common';

describe('NotificationServiceHealthController', () => {
  let controller: NotificationServiceHealthController;
  let healthService: NotificationServiceHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceHealthController],
      providers: [NotificationServiceHealthService],
    }).compile();

    controller = module.get<NotificationServiceHealthController>(
      NotificationServiceHealthController,
    );
    healthService = module.get<NotificationServiceHealthService>(
      NotificationServiceHealthService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getServiceName', () => {
    it('should return the correct service name', () => {
      // Using any to access protected method
      expect((controller as any).getServiceName()).toBe('notification-service');
    });
  });

  describe('checkComponents', () => {
    it('should include base components and database status', async () => {
      // Mock the database check method
      jest.spyOn(healthService, 'checkDatabase').mockResolvedValue({
        status: 'ok',
        details: {
          responseTime: 10,
          connection: 'established',
        },
      });

      // Call the protected method directly
      const result = await (controller as any).checkComponents();

      // Verify the result structure
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('database');
      expect(result.system).toHaveProperty('status', 'ok');
      expect(result.database).toHaveProperty('status', 'ok');
      expect(result.database.details).toHaveProperty('responseTime', 10);
      expect(result.database.details).toHaveProperty(
        'connection',
        'established',
      );
    });

    it('should handle database check errors', async () => {
      // Mock the database check method to return an error
      jest.spyOn(healthService, 'checkDatabase').mockResolvedValue({
        status: 'error',
        details: {
          message: 'Database connection failed',
        },
      });

      // Call the protected method directly
      const result = await (controller as any).checkComponents();

      // Verify the result structure
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('database');
      expect(result.system).toHaveProperty('status', 'ok');
      expect(result.database).toHaveProperty('status', 'error');
      expect(result.database.details).toHaveProperty(
        'message',
        'Database connection failed',
      );
    });
  });

  describe('check', () => {
    it('should return health status when all components are healthy', async () => {
      // Mock the checkComponents method
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        database: {
          status: 'ok',
          details: {
            responseTime: 10,
            connection: 'established',
          },
        },
      });

      const result = await controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'notification-service');
      expect(result).toHaveProperty('components');
      expect(result.components).toHaveProperty('system');
      expect(result.components).toHaveProperty('database');
      expect(result.components.system).toHaveProperty('status', 'ok');
      expect(result.components.database).toHaveProperty('status', 'ok');
    });

    it('should throw ServiceUnavailableException when any component has an error', async () => {
      // Mock the checkComponents method to return an error
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        database: {
          status: 'error',
          details: {
            message: 'Database connection failed',
          },
        },
      });

      await expect(controller.check()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('liveness', () => {
    it('should return basic liveness status', () => {
      const result = controller.liveness();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service', 'notification-service');
    });
  });

  describe('readiness', () => {
    it('should return readiness status when all components are ready', async () => {
      // Mock the checkComponents method
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        database: { status: 'ok' },
      });

      const result = await controller.readiness();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('components');
      expect(result.components).toHaveProperty('system');
      expect(result.components).toHaveProperty('database');
    });

    it('should throw ServiceUnavailableException when any component is not ready', async () => {
      // Mock the checkComponents method to return an error
      jest.spyOn(controller as any, 'checkComponents').mockResolvedValue({
        system: { status: 'ok' },
        database: { status: 'error' },
      });

      await expect(controller.readiness()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});

describe('NotificationServiceHealthService', () => {
  let service: NotificationServiceHealthService;

  beforeEach(() => {
    service = new NotificationServiceHealthService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkDatabase', () => {
    it('should return ok status with database details', async () => {
      const result = await service.checkDatabase();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('details');
      expect(result.details).toHaveProperty('responseTime', 10);
      expect(result.details).toHaveProperty('connection', 'established');
    });

    // Skip this test for now as it's difficult to simulate the error condition
    it.skip('should handle errors during database check', async () => {
      // This is a placeholder for a future test that would verify error handling
    });
  });
});
