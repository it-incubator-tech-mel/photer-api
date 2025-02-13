import { configModule } from '../../common/config/config.module';
import { Module } from '@nestjs/common';
import { CoreConfig } from './core/config/core.config';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { DeviceModule } from './features/devices/device.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    configModule,
    PrismaModule,
    AuthModule,
    DeviceModule,
  ],
  controllers: [],
  providers: [

  ],
})
export class AppModule {}
