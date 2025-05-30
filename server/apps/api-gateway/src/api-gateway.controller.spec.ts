import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController;
  let service: ApiGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        {
          provide: ApiGatewayService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    controller = module.get<ApiGatewayController>(ApiGatewayController);
    service = module.get<ApiGatewayService>(ApiGatewayService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('should return the string from the service', () => {
      // Arrange
      const expectedResult = 'Hello World!';
      const mockRequest = { url: '/test' } as any;
      jest.spyOn(service, 'getHello').mockReturnValue(expectedResult);

      // Act
      const result = controller.getHello(mockRequest);

      // Assert
      expect(result).toBe(expectedResult);
      expect(service.getHello).toHaveBeenCalled();
    });

    it('should handle different return values from the service', () => {
      // Arrange
      const expectedResult = 'Different greeting';
      const mockRequest = { url: '/test' };
      jest.spyOn(service, 'getHello').mockReturnValue(expectedResult);

      // Act
      const result = controller.getHello(mockRequest);

      // Assert
      expect(result).toBe(expectedResult);
      expect(service.getHello).toHaveBeenCalled();
    });
  });
});
