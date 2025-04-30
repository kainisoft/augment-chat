import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LokiClientService } from '../src/loki/loki-client.service';
import { LokiLabelService } from '../src/loki/loki-label.service';
import { LogLevel } from '../src/kafka/log-message.interface';

// Mock fetch for testing
global.fetch = jest.fn();

describe('LokiClientService', () => {
  let lokiClientService: LokiClientService;
  let lokiLabelService: LokiLabelService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [LokiClientService, LokiLabelService, ConfigService],
    }).compile();

    lokiClientService = module.get<LokiClientService>(LokiClientService);
    lokiLabelService = module.get<LokiLabelService>(LokiLabelService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(lokiClientService).toBeDefined();
    expect(lokiLabelService).toBeDefined();
  });

  describe('sendLogs', () => {
    it('should send logs to Loki', async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: 'success' }),
      });

      const logs = [
        {
          level: LogLevel.INFO,
          message: 'Test message',
          service: 'test-service',
          timestamp: '2023-07-18T12:00:00.000Z',
        },
      ];

      await expect(lokiClientService.sendLogs(logs)).resolves.not.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      // Mock failed response followed by successful response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: jest.fn().mockResolvedValueOnce({
            status: 'error',
            message: 'Test error',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({ status: 'success' }),
        });

      const logs = [
        {
          level: LogLevel.ERROR,
          message: 'Error message',
          service: 'test-service',
          timestamp: '2023-07-18T12:00:00.000Z',
        },
      ];

      await expect(lokiClientService.sendLogs(logs)).resolves.not.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle empty log array', async () => {
      await expect(lokiClientService.sendLogs([])).resolves.not.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('LokiLabelService', () => {
    it('should generate labels for a log message', () => {
      const logMessage = {
        level: LogLevel.INFO,
        message: 'Test message',
        service: 'test-service',
        context: 'TestContext',
        requestId: 'req-123',
        userId: 'user-456',
      };

      const labels = lokiLabelService.generateLabels(logMessage);

      expect(labels).toEqual(
        expect.objectContaining({
          service: 'test-service',
          level: LogLevel.INFO,
          context: 'TestContext',
          requestId: 'req-123',
          userId: 'user-456',
        }),
      );
    });

    it('should group logs by labels', () => {
      const logs = [
        {
          level: LogLevel.INFO,
          message: 'Test message 1',
          service: 'service-a',
        },
        {
          level: LogLevel.INFO,
          message: 'Test message 2',
          service: 'service-a',
        },
        {
          level: LogLevel.ERROR,
          message: 'Error message',
          service: 'service-b',
        },
      ];

      const groups = lokiLabelService.groupByLabels(logs);

      // Should have 2 groups (service-a/info and service-b/error)
      expect(groups.size).toBe(2);
    });
  });
});
