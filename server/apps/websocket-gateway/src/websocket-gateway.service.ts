import { Injectable } from '@nestjs/common';

@Injectable()
export class WebsocketGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
