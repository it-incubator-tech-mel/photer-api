import { AuthModule } from './features/auth/auth.module';
import { DeviceModule } from './features/devices/device.module';
import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, DeviceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
