import { Module } from '@nestjs/common';
import { ContactsModule } from './contacts/contacts.module';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Contact} from './contacts/entities/contact.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'contact',
      autoLoadEntities: true,
      entities: [Contact],
      retryAttempts: 5,
      synchronize: false,
    }),
    ContactsModule, HealthModule],
})
export class AppModule {}
