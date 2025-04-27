import { Test, TestingModule } from '@nestjs/testing';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';

describe('NotificationServiceController', () => {
  let controller: NotificationServiceController;
  let service: NotificationServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      providers: [
        {
          provide: NotificationServiceService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationServiceController>(NotificationServiceController);
    service = module.get<NotificationServiceService>(NotificationServiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return the string from the service', () => {
      // Arrange
      const expectedResult = 'Hello World!';
      jest.spyOn(service, 'getHello').mockReturnValue(expectedResult);

      // Act
      const result = controller.getHello();

      // Assert
      expect(result).toBe(expectedResult);
      expect(service.getHello).toHaveBeenCalled();
    });

    it('should handle different return values from the service', () => {
      // Arrange
      const expectedResult = 'Different greeting';
      jest.spyOn(service, 'getHello').mockReturnValue(expectedResult);

      // Act
      const result = controller.getHello();

      // Assert
      expect(result).toBe(expectedResult);
      expect(service.getHello).toHaveBeenCalled();
    });
  });
});
