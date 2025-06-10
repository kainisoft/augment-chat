import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketGatewayController } from './websocket-gateway.controller';
import { WebsocketGatewayService } from './websocket-gateway.service';

describe('WebsocketGatewayController', () => {
  let websocketGatewayController: WebsocketGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebsocketGatewayController],
      providers: [WebsocketGatewayService],
    }).compile();

    websocketGatewayController = app.get<WebsocketGatewayController>(
      WebsocketGatewayController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(websocketGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
