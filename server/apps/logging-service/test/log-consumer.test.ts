import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogConsumerService } from '../src/kafka/log-consumer.service';
import { LogMessageValidator } from '../src/kafka/log-message.validator';

describe('LogConsumerService', () => {
  let service: LogConsumerService;
  let validator: LogMessageValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [LogConsumerService, LogMessageValidator, ConfigService],
    }).compile();

    service = module.get<LogConsumerService>(LogConsumerService);
    validator = module.get<LogMessageValidator>(LogMessageValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('LogMessageValidator', () => {
    it('should validate a valid log message', () => {
      const validMessage = {
        level: 'info',
        message: 'Test message',
        service: 'test-service',
      };

      const result = validator.validate(validMessage);
      expect(result.isValid).toBe(true);
    });

    it('should reject an invalid log message', () => {
      const invalidMessage = {
        message: 'Test message',
        service: 'test-service',
      };

      const result = validator.validate(invalidMessage);
      expect(result.isValid).toBe(false);
    });

    it('should sanitize a log message', () => {
      const message = {
        level: 'info',
        message: 'Test message',
        service: 'test-service',
        metadata: { test: 'value' },
      };

      const sanitized = validator.sanitize(message);
      expect(sanitized).toEqual({
        level: 'info',
        message: 'Test message',
        service: 'test-service',
        metadata: { test: 'value' },
      });
    });
  });
});
