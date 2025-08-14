import { Module } from '@nestjs/common';
import { ContactsModule } from './contacts/contacts.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ContactsModule, HealthModule],
  controllers: [],
})
export class AppModule {}
