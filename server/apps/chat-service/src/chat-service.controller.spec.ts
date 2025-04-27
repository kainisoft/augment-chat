import { Test, TestingModule } from '@nestjs/testing';
import { ChatServiceController } from './chat-service.controller';
import { ChatServiceService } from './chat-service.service';

describe('ChatServiceController', () => {
  let controller: ChatServiceController;
  let service: ChatServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatServiceController],
      providers: [
        {
          provide: ChatServiceService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatServiceController>(ChatServiceController);
    service = module.get<ChatServiceService>(ChatServiceService);
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
  });
});
