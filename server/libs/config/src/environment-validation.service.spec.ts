import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnvironmentValidationService } from './environment-validation.service';

describe('EnvironmentValidationService', () => {
  let service: EnvironmentValidationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentValidationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnvironmentValidationService>(
      EnvironmentValidationService,
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User Service Validation', () => {
    it('should validate user service environment variables successfully', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockImplementation((key: string) => {
        const mockValues: Record<string, string> = {
          NODE_ENV: 'development',
          PORT: '4002',
          DATABASE_URL_USER:
            'postgresql://postgres:postgres@localhost:5432/user_db',
          JWT_SECRET: 'test-secret-key-that-is-long-enough',
          GRAPHQL_PLAYGROUND: 'true',
          QUERY_COMPLEXITY_LIMIT: '1000',
          CACHE_TTL: '300',
          REDIS_KEY_PREFIX: 'user:',
        };
        return mockValues[key];
      });

      const rules = service.getUserServiceRules();
      const result = service.validate(rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation with invalid database URL', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockImplementation((key: string) => {
        const mockValues: Record<string, string> = {
          NODE_ENV: 'development',
          DATABASE_URL_USER: 'invalid-url',
          JWT_SECRET: 'test-secret-key-that-is-long-enough',
        };
        return mockValues[key];
      });

      const rules = service.getUserServiceRules();
      const result = service.validate(rules);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes('DATABASE_URL_USER')),
      ).toBe(true);
    });
  });

  describe('Chat Service Validation', () => {
    it('should validate chat service environment variables successfully', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockImplementation((key: string) => {
        const mockValues: Record<string, string> = {
          NODE_ENV: 'development',
          PORT: '4003',
          MONGODB_URI: 'mongodb://mongo:mongo@localhost:27017/chat_db',
          JWT_SECRET: 'test-secret-key-that-is-long-enough',
          MAX_MESSAGE_LENGTH: '10000',
          WS_PORT: '4003',
          WS_PATH: '/graphql',
        };
        return mockValues[key];
      });

      const rules = service.getChatServiceRules();
      const result = service.validate(rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation with invalid MongoDB URI', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockImplementation((key: string) => {
        const mockValues: Record<string, string> = {
          NODE_ENV: 'development',
          MONGODB_URI: 'invalid-mongodb-uri',
          JWT_SECRET: 'test-secret-key-that-is-long-enough',
        };
        return mockValues[key];
      });

      const rules = service.getChatServiceRules();
      const result = service.validate(rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes('MONGODB_URI'))).toBe(
        true,
      );
    });
  });

  describe('Notification Service Validation', () => {
    it('should validate notification service environment variables successfully', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockImplementation((key: string) => {
        const mockValues: Record<string, string> = {
          NODE_ENV: 'development',
          PORT: '4004',
          MONGODB_URI: 'mongodb://mongo:mongo@localhost:27017/notification_db',
          JWT_SECRET: 'test-secret-key-that-is-long-enough',
          EMAIL_ENABLED: 'false',
          SMS_ENABLED: 'false',
          PUSH_ENABLED: 'true',
          NOTIFICATION_BATCH_SIZE: '100',
        };
        return mockValues[key];
      });

      const rules = service.getNotificationServiceRules();
      const result = service.validate(rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Service Rules Factory', () => {
    it('should return correct rules for each service', () => {
      expect(service.getServiceRules('user-service')).toEqual(
        service.getUserServiceRules(),
      );
      expect(service.getServiceRules('chat-service')).toEqual(
        service.getChatServiceRules(),
      );
      expect(service.getServiceRules('notification-service')).toEqual(
        service.getNotificationServiceRules(),
      );
      expect(service.getServiceRules('auth-service')).toEqual(
        service.getAuthServiceRules(),
      );
      expect(service.getServiceRules('api-gateway')).toEqual(
        service.getApiGatewayRules(),
      );
      expect(service.getServiceRules('logging-service')).toEqual(
        service.getLoggingServiceRules(),
      );
      expect(service.getServiceRules('unknown-service')).toEqual(
        service.getCommonRules(),
      );
    });
  });

  describe('Validation Rule Types', () => {
    it('should validate boolean values correctly', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockReturnValue('invalid-boolean');

      const rules = [
        {
          key: 'TEST_BOOLEAN',
          required: true,
          type: 'boolean' as const,
          description: 'Test boolean',
        },
      ];

      const result = service.validate(rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes('true'))).toBe(true);
    });

    it('should validate number ranges correctly', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockReturnValue('999');

      const rules = [
        {
          key: 'TEST_NUMBER',
          required: true,
          type: 'number' as const,
          min: 1000,
          max: 5000,
          description: 'Test number',
        },
      ];

      const result = service.validate(rules);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes('at least 1000')),
      ).toBe(true);
    });

    it('should validate email format correctly', () => {
      const mockGet = configService.get as jest.Mock;
      mockGet.mockReturnValue('invalid-email');

      const rules = [
        {
          key: 'TEST_EMAIL',
          required: true,
          type: 'email' as const,
          description: 'Test email',
        },
      ];

      const result = service.validate(rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes('valid email'))).toBe(
        true,
      );
    });
  });
});
