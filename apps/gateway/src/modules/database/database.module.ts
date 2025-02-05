import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../../config/database.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DatabaseConfig,
      useFactory: (configService: ConfigService<any, true>) => new DatabaseConfig(configService),
      inject: [ConfigService],
    },
  ],
  exports: [DatabaseConfig],
})
export class DatabaseModule {}
