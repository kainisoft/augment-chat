import { Controller, Get } from '@nestjs/common';
import { WebsocketGatewayService } from './websocket-gateway.service';

@Controller()
export class WebsocketGatewayController {
  constructor(
    private readonly websocketGatewayService: WebsocketGatewayService,
  ) {}

  @Get()
  getHello(): string {
    return this.websocketGatewayService.getHello();
  }
}
