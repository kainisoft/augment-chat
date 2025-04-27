import { Test, TestingModule } from '@nestjs/testing';
import { ChatServiceService } from './chat-service.service';

describe('ChatServiceService', () => {
  let service: ChatServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatServiceService],
    }).compile();

    service = module.get<ChatServiceService>(ChatServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!');
    });
  });
});
