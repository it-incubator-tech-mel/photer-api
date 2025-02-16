import { configModule } from '../../common/config/config.module';
import { AuthModule } from './features/auth/auth.module';
import { DeviceModule } from './features/devices/device.module';
import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';

@Module({
  imports: [
    configModule,
    PrismaModule,
    AuthModule,
    DeviceModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [

  ],
})
export class AppModule {}
