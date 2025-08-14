import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
  };

  const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryHealthIndicator,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the health status', async () => {
    await expect(controller.check()).resolves.toEqual({
      memory: 'up',
      database: 'up',
    });
  });
});
