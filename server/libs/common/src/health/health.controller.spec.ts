import { Test, TestingModule } from '@nestjs/testing';
import { BaseHealthController } from './health.controller';

describe('BaseHealthController', () => {
  let controller: BaseHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaseHealthController],
    }).compile();

    controller = module.get<BaseHealthController>(BaseHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status', async () => {
    const result = await controller.check();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('service', 'service');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('system');
    expect(result.system).toHaveProperty('memory');
    expect(result.system).toHaveProperty('cpu');
    expect(result.system).toHaveProperty('hostname');
    expect(result.system).toHaveProperty('platform');
    expect(result).toHaveProperty('components');
    expect(result.components).toHaveProperty('system');
    expect(result.components.system).toHaveProperty('status', 'ok');
  });

  it('should return liveness status', () => {
    const result = controller.liveness();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('service', 'service');
  });

  it('should return readiness status', async () => {
    const result = await controller.readiness();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('components');
    expect(result.components).toHaveProperty('system');
    expect(result.components.system).toHaveProperty('status', 'ok');
  });
});
