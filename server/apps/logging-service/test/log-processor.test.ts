import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogProcessorService } from '../src/processing/log-processor.service';
import { LogFilterService } from '../src/processing/log-filter.service';
import { LogBatchService } from '../src/processing/log-batch.service';
import { LogLevel } from '../src/kafka/log-message.interface';

describe('LogProcessorService', () => {
  let processorService: LogProcessorService;
  let filterService: LogFilterService;
  let batchService: LogBatchService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        LogProcessorService,
        LogFilterService,
        LogBatchService,
        ConfigService,
      ],
    }).compile();

    processorService = module.get<LogProcessorService>(LogProcessorService);
    filterService = module.get<LogFilterService>(LogFilterService);
    batchService = module.get<LogBatchService>(LogBatchService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(processorService).toBeDefined();
    expect(filterService).toBeDefined();
    expect(batchService).toBeDefined();
  });

  describe('processLogMessage', () => {
    it('should enrich a log message with additional metadata', () => {
      const logMessage = {
        level: LogLevel.INFO,
        message: 'Test message',
        service: 'test-service',
        requestId: 'req-123',
      };

      const processedLog = processorService.processLogMessage(logMessage);
      
      expect(processedLog).toBeDefined();
      if (processedLog) {
        expect(processedLog.timestamp).toBeDefined();
        expect(processedLog.traceId).toBeDefined();
        expect(processedLog.traceId).toContain('corr-req-123');
        expect(processedLog.metadata).toBeDefined();
        expect(processedLog.metadata?.processedAt).toBeDefined();
        expect(processedLog.metadata?.loggingService).toBeDefined();
      }
    });

    it('should return null for filtered out messages', () => {
      // Mock the filter service to filter out all messages
      jest.spyOn(filterService, 'shouldProcessLog').mockReturnValue(false);

      const logMessage = {
        level: LogLevel.DEBUG,
        message: 'Debug message that should be filtered',
        service: 'test-service',
      };

      const processedLog = processorService.processLogMessage(logMessage);
      expect(processedLog).toBeNull();
    });

    it('should add error information for error logs', () => {
      const errorLog = {
        level: LogLevel.ERROR,
        message: 'Error message',
        service: 'test-service',
        stack: 'Error: Test error\n    at TestFunction',
        code: 'TEST_ERROR',
      };

      const processedLog = processorService.processLogMessage(errorLog);
      
      expect(processedLog).toBeDefined();
      if (processedLog) {
        expect(processedLog.metadata?.error).toBeDefined();
        expect(processedLog.metadata?.error.stack).toBe(errorLog.stack);
        expect(processedLog.metadata?.error.code).toBe(errorLog.code);
      }
    });
  });

  describe('LogFilterService', () => {
    it('should filter logs based on log level', () => {
      // Mock the config service to return 'info' as the log level
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        if (key === 'LOG_LEVEL') return 'info';
        return undefined;
      });

      // These should pass the filter
      expect(filterService.shouldProcessLog({
        level: LogLevel.ERROR,
        message: 'Error message',
        service: 'test-service',
      })).toBe(true);

      expect(filterService.shouldProcessLog({
        level: LogLevel.WARN,
        message: 'Warning message',
        service: 'test-service',
      })).toBe(true);

      expect(filterService.shouldProcessLog({
        level: LogLevel.INFO,
        message: 'Info message',
        service: 'test-service',
      })).toBe(true);

      // These should be filtered out
      expect(filterService.shouldProcessLog({
        level: LogLevel.DEBUG,
        message: 'Debug message',
        service: 'test-service',
      })).toBe(false);

      expect(filterService.shouldProcessLog({
        level: LogLevel.VERBOSE,
        message: 'Verbose message',
        service: 'test-service',
      })).toBe(false);
    });
  });

  describe('LogBatchService', () => {
    it('should add logs to batch', () => {
      const logMessage = {
        level: LogLevel.INFO,
        message: 'Test message',
        service: 'test-service',
      };

      // Add a log to the batch
      batchService.addToBatch(logMessage);

      // Register a batch processor to test batch processing
      let processedBatch: any[] = [];
      batchService.registerBatchProcessor(async (batch) => {
        processedBatch = batch;
        return Promise.resolve();
      });

      // Process the batch
      batchService.processBatch();

      // Verify the batch was processed
      expect(processedBatch.length).toBe(1);
      expect(processedBatch[0]).toEqual(logMessage);
    });
  });
});
