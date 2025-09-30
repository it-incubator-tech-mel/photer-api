import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.ENV_TYPE || 'development'}`,
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class AppModule {}
