import { Controller, Get } from '@nestjs/common';
import {MemoryHealthIndicator} from '@nestjs/terminus'

@Controller('health')
export class HealthController {
  constructor(private memory: MemoryHealthIndicator) {}

  @Get()
  async check(): Promise<string> {
    let memory = await this.memory.checkHeap('memory_heap', 150 * 1024 * 1024);
    return memory.memory_heap.status === 'up' ? 'OK' : 'Memory usage is too high';
  }
}
