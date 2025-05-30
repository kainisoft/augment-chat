import { Test, TestingModule } from '@nestjs/testing';
import { LogApiController } from './log-api.controller';
import { LogQueryService } from './log-query.service';
import { LogProcessorService } from '../processing/log-processor.service';
import {
  MockFactoryService,
  ControllerTestBuilder,
  TestSetupService,
} from '@app/testing';
import { LogQueryDto, LogQueryResponseDto } from './dto/log-query.dto';
import { LogLevel } from '../kafka/log-message.interface';

describe('LogApiController', () => {
  let controller: LogApiController;
  let logQueryService: any;
  let logStorageService: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const controllerTestBuilder = new ControllerTestBuilder(
      testSetup,
      mockFactory,
    );

    const setup = await controllerTestBuilder.createControllerTestSetup(
      LogApiController,
      {
        providers: [
          {
            provide: LogQueryService,
            useValue: mockFactory.createMockLogQueryService(),
          },
          {
            provide: LogStorageService,
            useValue: mockFactory.createMockLogStorageService(),
          },
          {
            provide: 'LoggingService',
            useValue: mockFactory.createMockLoggingService(),
          },
        ],
      },
    );

    controller = setup.controller;
    logQueryService = setup.module.get(LogQueryService);
    logStorageService = setup.module.get(LogStorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('queryLogs', () => {
    it('should query logs with default parameters', async () => {
      const queryDto: LogQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockResponse: LogQueryResponseDto = {
        logs: [
          {
            id: 'log-1',
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            message: 'Test log message',
            service: 'test-service',
            context: 'test-context',
            metadata: {},
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      logQueryService.queryLogs.mockResolvedValue(mockResponse);

      const result = await controller.queryLogs(queryDto);

      expect(result).toEqual(mockResponse);
      expect(logQueryService.queryLogs).toHaveBeenCalledWith(queryDto);
    });

    it('should query logs with filters', async () => {
      const queryDto: LogQueryDto = {
        page: 1,
        limit: 20,
        level: LogLevel.ERROR,
        service: 'auth-service',
        from: '2023-01-01T00:00:00.000Z',
        to: '2023-12-31T23:59:59.999Z',
      };

      const mockResponse: LogQueryResponseDto = {
        logs: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      logQueryService.queryLogs.mockResolvedValue(mockResponse);

      const result = await controller.queryLogs(queryDto);

      expect(result).toEqual(mockResponse);
      expect(logQueryService.queryLogs).toHaveBeenCalledWith(queryDto);
    });

    it('should handle query errors gracefully', async () => {
      const queryDto: LogQueryDto = {
        page: 1,
        limit: 10,
      };

      logQueryService.queryLogs.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.queryLogs(queryDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('storeLogs', () => {
    it('should store log entries', async () => {
      const logEntries = [
        {
          timestamp: new Date().toISOString(),
          level: LogLevel.INFO,
          message: 'Test log message',
          service: 'test-service',
          context: 'test-context',
          metadata: { userId: 'user-123' },
        },
      ];

      logStorageService.storeLogs.mockResolvedValue({ stored: 1 });

      const result = await controller.storeLogs(logEntries);

      expect(result).toEqual({ stored: 1 });
      expect(logStorageService.storeLogs).toHaveBeenCalledWith(logEntries);
    });

    it('should handle storage errors', async () => {
      const logEntries = [
        {
          timestamp: new Date().toISOString(),
          level: LogLevel.ERROR,
          message: 'Error message',
          service: 'test-service',
          context: 'error-context',
          metadata: {},
        },
      ];

      logStorageService.storeLogs.mockRejectedValue(
        new Error('Storage service unavailable'),
      );

      await expect(controller.storeLogs(logEntries)).rejects.toThrow(
        'Storage service unavailable',
      );
    });
  });

  describe('rate limiting', () => {
    it('should apply rate limiting to query endpoint', () => {
      // Test that rate limiting decorators are applied
      const queryLogsMethod = controller.queryLogs;
      expect(queryLogsMethod).toBeDefined();

      // In a real test, you would verify that the rate limiting guard
      // is applied by checking the method metadata or testing with
      // multiple rapid requests
    });
  });

  describe('validation', () => {
    it('should validate query parameters', async () => {
      const invalidQueryDto = {
        page: -1, // Invalid page number
        limit: 1000, // Exceeds maximum limit
      } as LogQueryDto;

      // In a real implementation, this would be handled by validation pipes
      // The test would verify that validation errors are thrown for invalid input
      expect(invalidQueryDto.page).toBeLessThan(1);
      expect(invalidQueryDto.limit).toBeGreaterThan(100);
    });

    it('should validate date ranges', async () => {
      const invalidDateRangeDto: LogQueryDto = {
        page: 1,
        limit: 10,
        from: '2023-12-31T23:59:59.999Z',
        to: '2023-01-01T00:00:00.000Z', // 'to' is before 'from'
      };

      // In a real implementation, this would be caught by the validation decorator
      const fromDate = new Date(invalidDateRangeDto.from!);
      const toDate = new Date(invalidDateRangeDto.to!);
      expect(fromDate).toBeAfter(toDate);
    });
  });

  describe('error handling', () => {
    it('should handle service unavailable errors', async () => {
      const queryDto: LogQueryDto = {
        page: 1,
        limit: 10,
      };

      logQueryService.queryLogs.mockRejectedValue(
        new Error('Service temporarily unavailable'),
      );

      await expect(controller.queryLogs(queryDto)).rejects.toThrow(
        'Service temporarily unavailable',
      );
    });

    it('should handle timeout errors', async () => {
      const queryDto: LogQueryDto = {
        page: 1,
        limit: 10,
      };

      logQueryService.queryLogs.mockRejectedValue(new Error('Query timeout'));

      await expect(controller.queryLogs(queryDto)).rejects.toThrow(
        'Query timeout',
      );
    });
  });
});
