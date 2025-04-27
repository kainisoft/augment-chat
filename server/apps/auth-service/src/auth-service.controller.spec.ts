import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';

describe('AuthServiceController', () => {
  let controller: AuthServiceController;
  let service: AuthServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthServiceController],
      providers: [
        {
          provide: AuthServiceService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthServiceController>(AuthServiceController);
    service = module.get<AuthServiceService>(AuthServiceService);
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
