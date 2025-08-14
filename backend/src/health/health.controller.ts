import { Controller, Get } from '@nestjs/common';
import {
    HealthIndicatorStatus,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

interface HealthCheckResponse {
  database: HealthIndicatorStatus;
  memory: HealthIndicatorStatus;
}

@Controller('health')
export class HealthController {
  constructor(
    private memory: MemoryHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  async check(): Promise<HealthCheckResponse> {

    const memoryResult = await this.memory.checkHeap(
      'memory_heap',
      150 * 1024 * 1024,
    );
    const databaseResult = await this.db.pingCheck('database');

    return {
      memory: memoryResult.memory_heap.status,
      database: databaseResult.database.status,
    };
  }
}
